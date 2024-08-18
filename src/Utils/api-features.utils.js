export class ApiFeatures{
    //mongooseQuery : model.method()
    //query : req.query
    constructor(mongooseQuery, query){
        this.query=query;
        this.mongooseQuery=mongooseQuery;
    }
    //methods
    //1-sort
    sort(){
        this.mongooseQuery.sort(this.query.sort)
        return this;
    }
    //2-pagination
    pagination(){
        const{ page = 1, limit = 5} = this.query
        const skip = ( page - 1 ) * limit

        const options ={
            page,
            limit
        }
       this.mongooseQuery.skip(skip).limit(limit)
        return this;
    }
    //3-filters
    filters(){
        const{ page = 1, limit = 5, sort,...filters} = this.query

        const filterString=JSON.stringify(filters)
        const replacefilter= filterString.replaceAll(/lt|gt|lte|gte|regex|ne|eq/g, (ele)=>`$${ele}`)
        const parseFilter = JSON.parse(replacefilter)

        this.mongooseQuery.find(parseFilter)

        return this;
    }

}