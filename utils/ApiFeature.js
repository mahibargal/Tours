class APiFeatures {

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString
    }

    filterQuery() {
        const reqObj = { ...this.queryString };
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach(elm => delete reqObj[elm]);

        let queryStr = JSON.stringify(reqObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // replace with $    http://localhost:3000/api/tours/v1?duration[gte]=4&page=4
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sortQuery() {

        if (this.queryString?.sort) {
            // '?sort=-abc,-xyz'
            const sortBy = this.queryString?.sort.split(",").join(" "); //http://localhost:3000/api/tours/v1?duration[gte]=4&page=4&sort=-price,-duration
            this.query = this.query.sort(sortBy);

        } else {
            this.query = this.query.sort('-maxGroupSize'); //default sorting
        }

        return this;
    }


    selectFields() {
        if (this.queryString?.fields) {
            //?fields=duration,price,time
            const fields = this.queryString?.fields.split(",").join(" ")
            this.query = this.query.select(fields) // select('field1 field2 field3 field4)
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination() {
        //query.skip(1).limit(20)
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this
    }

}

module.exports = APiFeatures;