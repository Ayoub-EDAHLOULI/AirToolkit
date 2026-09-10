declare module "cronstrue" {
  interface CronstrueOptions {
    throwExceptionOnParseError?: boolean;
    verbose?: boolean;
    use24HourTimeFormat?: boolean;
    locale?: string;
  }

  const cronstrue: {
    toString(expression: string, options?: CronstrueOptions): string;
  };

  export default cronstrue;
}
