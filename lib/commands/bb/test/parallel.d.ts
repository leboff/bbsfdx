import { flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
export default class Parallel extends SfdxCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
    }[];
    protected static flagsConfig: {
        disable: flags.Discriminated<flags.Boolean<boolean>>;
        enable: flags.Discriminated<flags.Boolean<boolean>>;
        keep: flags.Discriminated<flags.Boolean<boolean>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<AnyJson>;
}
