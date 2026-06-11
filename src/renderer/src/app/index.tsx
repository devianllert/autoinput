import { Frame } from './frame';

export const App = (): React.ReactNode => {
  return (
    <Frame>
      <div className="flex flex-1 flex-col p-2">
        <div className="flex flex-col gap-2">
          <div className="bg-card flex flex-col gap-2 rounded-md p-2">Hello world</div>
        </div>
      </div>
    </Frame>
  );
};
