import { flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
export default class Add extends SfdxCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
    }[];
    protected static flagsConfig: {
        range: flags.Discriminated<flags.Array<string[]>>;
        ignoreerrors: flags.Discriminated<flags.Boolean<boolean>>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<AnyJson>;
}
