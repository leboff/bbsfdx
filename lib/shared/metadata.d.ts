import { DeployResult, RetrieveResult } from './types';
export declare function deployMetadata(conn: any, zipFile: any, ux: any, messages: any, deployOptions: any): Promise<DeployResult>;
export declare function retrieveMetadata(conn: any, types: any, ux: any, messages: any): Promise<RetrieveResult>;
