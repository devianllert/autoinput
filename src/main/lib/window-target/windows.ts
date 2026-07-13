import path from 'node:path';
import koffi from 'koffi';

import type { WindowTarget } from '@/shared/window-target/types';

const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
const MAX_PROCESS_PATH_CHARS = 32_768;

type Hwnd = object;

type WindowsApi = {
  enumWindows: (callback: (hwnd: Hwnd) => boolean) => boolean;
  getForegroundWindow: () => Hwnd | null;
  getWindowTextLength: (hwnd: Hwnd) => number;
  getWindowText: (hwnd: Hwnd, buffer: Buffer, maxCount: number) => number;
  isWindowVisible: (hwnd: Hwnd) => boolean;
  getWindowThreadProcessId: (hwnd: Hwnd, processId: Buffer) => number;
  openProcess: (access: number, inheritHandle: boolean, processId: number) => unknown;
  queryFullProcessImageName: (
    process: unknown,
    flags: number,
    fileName: Buffer,
    size: Buffer,
  ) => boolean;
  closeHandle: (handle: unknown) => boolean;
};

let api: WindowsApi | null = null;

const trimNullTerminatedUtf16 = (buffer: Buffer): string => {
  return buffer.toString('utf16le').replace(/\0.*$/u, '').trim();
};

const getApi = (): WindowsApi | null => {
  if (process.platform !== 'win32') {
    return null;
  }

  if (api) {
    return api;
  }

  const user32 = koffi.load('user32.dll');
  const kernel32 = koffi.load('kernel32.dll');
  const enumWindowsProc = koffi.proto('bool __stdcall EnumWindowsProc(void *hwnd, long lParam)');

  const enumWindows = user32.func('EnumWindows', 'bool', [koffi.pointer(enumWindowsProc), 'long']);

  api = {
    enumWindows: (callback) => Boolean(enumWindows((hwnd: Hwnd) => callback(hwnd), 0)),
    getForegroundWindow: () => user32.func('GetForegroundWindow', 'void *', [])() as Hwnd | null,
    getWindowTextLength: user32.func('GetWindowTextLengthW', 'int', ['void *']),
    getWindowText: user32.func('GetWindowTextW', 'int', ['void *', 'void *', 'int']),
    isWindowVisible: user32.func('IsWindowVisible', 'bool', ['void *']),
    getWindowThreadProcessId: user32.func('GetWindowThreadProcessId', 'uint', [
      'void *',
      koffi.out(koffi.pointer('uint')),
    ]),
    openProcess: kernel32.func('OpenProcess', 'void *', ['uint', 'bool', 'uint']),
    queryFullProcessImageName: kernel32.func('QueryFullProcessImageNameW', 'bool', [
      'void *',
      'uint',
      'void *',
      koffi.inout(koffi.pointer('uint')),
    ]),
    closeHandle: kernel32.func('CloseHandle', 'bool', ['void *']),
  };

  return api;
};

const getWindowTitle = (winApi: WindowsApi, hwnd: Hwnd): string => {
  const length = winApi.getWindowTextLength(hwnd);

  if (length <= 0) {
    return '';
  }

  const buffer = Buffer.alloc((length + 1) * 2);
  winApi.getWindowText(hwnd, buffer, length + 1);

  return trimNullTerminatedUtf16(buffer);
};

const getProcessPath = (winApi: WindowsApi, processId: number): string | null => {
  const handle = winApi.openProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, processId);

  if (!handle) {
    return null;
  }

  try {
    const buffer = Buffer.alloc(MAX_PROCESS_PATH_CHARS * 2);
    const size = Buffer.alloc(4);
    size.writeUInt32LE(MAX_PROCESS_PATH_CHARS);

    if (!winApi.queryFullProcessImageName(handle, 0, buffer, size)) {
      return null;
    }

    return trimNullTerminatedUtf16(buffer.subarray(0, size.readUInt32LE() * 2));
  } finally {
    winApi.closeHandle(handle);
  }
};

const getProcessId = (winApi: WindowsApi, hwnd: Hwnd): number | null => {
  const processId = Buffer.alloc(4);
  winApi.getWindowThreadProcessId(hwnd, processId);

  const value = processId.readUInt32LE();

  return value === 0 ? null : value;
};

const toWindowTarget = (winApi: WindowsApi, hwnd: Hwnd): WindowTarget | null => {
  if (!winApi.isWindowVisible(hwnd)) {
    return null;
  }

  const title = getWindowTitle(winApi, hwnd);

  if (!title) {
    return null;
  }

  const processId = getProcessId(winApi, hwnd);

  if (!processId) {
    return null;
  }

  const processPath = getProcessPath(winApi, processId);
  const processName = processPath ? path.basename(processPath) : `PID ${processId}`;
  const id = (processPath ?? processName).toLocaleLowerCase();

  return {
    id,
    title,
    processName,
    processPath,
  };
};

export const getActiveWindowTarget = (): WindowTarget | null => {
  const winApi = getApi();

  if (!winApi) {
    return null;
  }

  const hwnd = winApi.getForegroundWindow();

  if (!hwnd) {
    return null;
  }

  return toWindowTarget(winApi, hwnd);
};

export const listWindowTargets = (): WindowTarget[] => {
  const winApi = getApi();

  if (!winApi) {
    return [];
  }

  const targets = new Map<string, WindowTarget>();

  winApi.enumWindows((hwnd) => {
    const target = toWindowTarget(winApi, hwnd);

    if (target && !targets.has(target.id)) {
      targets.set(target.id, target);
    }

    return true;
  });

  return Array.from(targets.values()).sort((a, b) => a.processName.localeCompare(b.processName));
};
