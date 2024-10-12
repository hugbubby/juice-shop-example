module.exports = function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    // Fix: Use parameterized query to prevent SQL injection
    // The previous version concatenated user input directly into the SQL query,
    // which could allow malicious users to inject arbitrary SQL commands.
    // This new version uses a parameterized query with the :criteria placeholder,
    // ensuring that user input is properly escaped and treated as data, not code.
    models.sequelize.query(
      "SELECT * FROM Products WHERE ((name LIKE :criteria OR description LIKE :criteria) AND deletedAt IS NULL) ORDER BY name",
      {
        replacements: { criteria: `%${criteria}%` },
        type: models.sequelize.QueryTypes.SELECT
      }
    )
      .then(([products]: any) => {
        const dataString = JSON.stringify(products)
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }
        res.json(utils.queryResultToJson(products))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
