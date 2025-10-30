class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // NOTE: This method is correct, but it is NOT used by the getWorkOrders
  // controller anymore because that controller has more complex, custom filtering.
  // It can still be used by other, simpler controllers if needed.
  filter(searchableFields = []) {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);
    const filter = {};
    Object.keys(queryObj).forEach((key) => {
      const match = key.match(/(.+)\[(gte|gt|lte|lt)\]/);
      if (match) {
        const field = match[1];
        const operator = match[2];
        const value = queryObj[key];
        if (!filter[field]) {
          filter[field] = {};
        }
        filter[field][`$${operator}`] = value;
      } else {
        filter[key] = queryObj[key];
      }
    });
    if (this.queryString.search && searchableFields.length > 0) {
      const searchTerm = this.queryString.search;
      const orConditions = searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      }));
      filter.$or = orConditions;
    }
    this.query = this.query.find(filter);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  async execute() {
    if (this.queryString.page === "0") {
      const documents = await this.query;
      return {
        documents,
        pagination: {
          totalItems: documents.length,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: documents.length,
        },
      };
    }
    const countQuery = this.query.clone();
    const totalCount = await countQuery.model.countDocuments(
      countQuery.getFilter()
    );
    this.paginate();
    const documents = await this.query;
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const totalPages = Math.ceil(totalCount / limit);
    return {
      documents,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }
}

export default ApiFeatures;
