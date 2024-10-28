

// export class ApiFeatures{
//     //mongooseQuery : model.method()
//     //query : req.query
//     constructor(model, query, populate){
//         this.model = model
//         this.query=query;
//         // this.mongooseQuery=mongooseQuery;
//         this.populate= populate
//         this.filterObject ={}
//         this.paginationObject ={}
//     }
//     //methods
//     //1-sort
//     sort(){
//         this.model.sort(this.query.sort)
//         return this;
//     }
//     //2-pagination
//     pagination(){
//         const{ page = 1, limit = 2} = this.query
//         const skip = ( page - 1 ) * limit

//         const paginationObject ={
//             page,
//             limit:parseInt(limit)
//         }
//        this.model.skip(skip).limit(limit)
//         return this;
//     }
//     //3-filters
//     filters(){
//         const{ page = 1, limit = 5, sort,...filters} = this.query

//         const filterString=JSON.stringify(filters)
//         const replacefilter= filterString.replaceAll(/lt|gt|lte|gte|regex|ne|eq/g, (ele)=>`$${ele}`)
//         const parseFilter = JSON.parse(replacefilter)

//         this.model.find(parseFilter)

//         return this;
//     }

// }

export class ApiFeatures{
    //mongooseQuery=> model
    //query=> req.query
    constructor(mongooseQuery, query,select) {
        this.mongooseQuery = mongooseQuery
        this.query = query
        this.select = select
        this.options = {}
    }
    
    filter_sort_pagination() {
        const { page = 1, limit = 3, sort, ...filters } = this.query;
        //selecting
        if (this.select) {
            this.options.select={select:this.select}
        }
        //sort
        if (sort) {
            const sortObj = Object.entries(sort).reduce((acc, [key, value]) => {
                acc[key] = parseInt(value); // convert to number
          return acc;
            }, {});
            
            this.options.sort = sortObj;
        }
        //filter
        const stringfilters = JSON.stringify(filters);
        const replacefilters = stringfilters.replaceAll(
            /gt|gte|lt|lte/g,
            (ele) => `$${ele}`
        );
        const parsefilters = JSON.parse(replacefilters);
        //pagination
        const skip = (page - 1) * limit;
        this.options.page = page
        this.options.limit = limit
        this.options.skip = skip
        
        this.mongooseQuery = this.mongooseQuery.paginate(
            parsefilters,
            this.options
        );
        return this
    }
}
    