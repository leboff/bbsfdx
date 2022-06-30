import { SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
export default class Parallel extends SfdxCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
    }[];
    protected static flagsConfig: {};
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<AnyJson>;
}
