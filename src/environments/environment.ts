// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // API_URL: 'https://api.kpikarta.com'
  // API_URL: 'http://159.89.234.66:3340'
  API_URL: 'http://localhost:3000',
  CHARGEBEE_API_KEY: 'test_6btSkQzxZJ1Vzvrv88VUZYtKcdUWZX1SV',
  CHARGEBEE_GATEWAY_ID: 'gw_16CIaiTdEaPET9sk',
  CHARGEBEE_SITE_URL: 'https://kpikarta-test.chargebee.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
