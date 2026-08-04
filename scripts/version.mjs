import semver from "semver";

export function checkValidations({ version, newVersion }) {
  if (!newVersion) {
    console.log(`No version entered`);

    return true;
  }

  if (!semver.valid(newVersion)) {
    console.log(`Version must have a semver format (x.x.x example: 1.0.1)`);

    return true;
  }

  if (semver.ltr(newVersion, version)) {
    console.log(`New version is lower than current version`);

    return true;
  }

  if (semver.eq(newVersion, version)) {
    console.log(`New version is equal to current version`);

    return true;
  }
}
