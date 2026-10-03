# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# tuktuk-app

## Verification

This app uses Expo SDK 55. Run `npm ci`, `npm run lint`, `npx tsc --noEmit`,
and `npx expo install --check`. Export all targets with
`npx expo export --platform all`. Successful exports verify JavaScript bundling,
not native device behavior; iOS requires full Xcode and Android requires its SDK.

Set `EXPO_PUBLIC_API_URL` before exporting to point to a test-only backend.
Serve the web export with extensionless-route fallback, then run
`MOBILE_TEST_URL=http://localhost:3000 npm run test:web`.
Install Chromium using `npx playwright install chromium`, or provide an existing
browser with `CHROME_PATH`. Optional `MOBILE_TEST_EMAIL` and
`MOBILE_TEST_PASSWORD` enable real login/logout tests using a synthetic customer.
The smoke test checks mobile and desktop viewports and fails on runtime exceptions.
With test credentials it also simulates an expired access response, exercises real
refresh rotation, and confirms a logged-out refresh token is rejected by the API.

Native credentials use SecureStore. Web credentials stay in memory and are not
persisted across reloads; refresh/logout requests include the backend's HTTP-only
cookie. The Babel preset transforms dependency `import.meta` syntax for Metro.

Compatible dependency updates remove the critical advisory present in the old
lockfile. `npm audit` still reports 31 transitive advisories (21 high, 10 moderate)
in the Expo/React Native dependency tree. Do not use `npm audit fix --force`:
its proposed Expo/Router downgrades break the SDK pairing. Review the remaining
advisories and supported upstream fixes before a production release.
