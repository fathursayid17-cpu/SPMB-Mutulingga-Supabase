// This file provides type definitions for the environment.

// Augment NodeJS.ProcessEnv to include API_KEY.
// This supports usage of process.env.API_KEY in the code without redeclaring 'process'.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string | undefined;
    [key: string]: string | undefined;
  }
}
