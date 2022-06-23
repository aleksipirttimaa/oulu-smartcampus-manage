// this file is used by the docker-compose build
// api endpoint is hardcoded here, as this file is
// compiled to be loaded by the browser, which complicates
// things

export const environment = {
  production: true,
  api: 'https://smartcampus.oulu.fi/manage/api'
};
