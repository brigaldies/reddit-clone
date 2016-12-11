// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,

  // newsapi.org: brigaldies@gmail.com/Angular2isgreat!
  // API key: ec63c02c48cd4611964c24bb7f0bd54c
  baseUrl: 'https://newsapi.org',
  newsApiKey: 'ec63c02c48cd4611964c24bb7f0bd54c'
};
