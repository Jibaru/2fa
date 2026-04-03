export namespace core {
	
	export class EntryWithCode {
	    id: string;
	    issuer: string;
	    name: string;
	    code: string;
	    remaining: number;
	    period: number;
	
	    static createFrom(source: any = {}) {
	        return new EntryWithCode(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.issuer = source["issuer"];
	        this.name = source["name"];
	        this.code = source["code"];
	        this.remaining = source["remaining"];
	        this.period = source["period"];
	    }
	}

}

