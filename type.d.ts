// types.d.ts

// Formidable types
declare module 'formidable' {
    export interface File {
        filepath: string;
        originalFilename: string;
        mimetype: string;
        size: number;
        [key: string]: any;
    }

    export interface Options {
        multiples?: boolean;
        keepExtensions?: boolean;
        [key: string]: any;
    }

    export interface IncomingForm {
        parse(
            req: import('http').IncomingMessage,
            callback: (err: any, fields: any, files: { [key: string]: File | File[] }) => void
        ): void;
    }

    export default function formidable(options?: Options): IncomingForm;
}

// PDF Parse types
declare module 'pdf-parse' {
    interface PDFData {
        numpages: number;
        text: string;
        version: string;
        info: any;
        metadata: any;
    }

    function PDFParse(dataBuffer: Buffer): Promise<PDFData>;
    export = PDFParse;
}

// PostgreSQL types
declare module 'pg' {
    export interface PoolConfig {
        user?: string;
        password?: string;
        host?: string;
        port?: number;
        database?: string;
        connectionString?: string;
        ssl?: boolean | { rejectUnauthorized: boolean };
        max?: number;
        idleTimeoutMillis?: number;
        connectionTimeoutMillis?: number;
        maxUses?: number;
    }

    export interface QueryResult<T = any> {
        rows: T[];
        rowCount: number | null;
        command: string;
        oid: number;
        fields: FieldDef[];
    }

    export interface FieldDef {
        name: string;
        tableID: number;
        columnID: number;
        dataTypeID: number;
        dataTypeSize: number;
        dataTypeModifier: number;
        format: string;
    }

    export class Pool {
        constructor(config?: PoolConfig);
        connect(): Promise<PoolClient>;
        end(): Promise<void>;
        query<T = any>(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult<T>>;
        on(event: string, listener: Function): this;
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    }

    export interface QueryConfig {
        text: string;
        values?: any[];
        name?: string;
        rowMode?: string;
        types?: any;
    }

    export interface PoolClient {
        query<T = any>(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult<T>>;
        release(err?: Error): void;
        on(event: string, listener: Function): this;
    }

    export class Client {
        constructor(config?: PoolConfig);
        connect(): Promise<void>;
        end(): Promise<void>;
        query<T = any>(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult<T>>;
        on(event: string, listener: Function): this;
    }
}
