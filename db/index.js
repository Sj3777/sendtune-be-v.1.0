const {
  Pool
} = require('pg');
const async=require('async');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'projman',
  password: 'admin@123',
  port: '5432',
  max: 500,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

// console.log("Pool---", pool)

class db{
  static query(text, params, callback){
    const start = Date.now()
    return pool.query(text, params, (err, res) => {
      const duration = Date.now() - start;
      if (err) {
        //// console.error('executed query', {
        ////   text,
        ////   duration: duration + " ms",
        ////   err: err
        //// })
      } else {
        //// console.info('executed query', {
        ////   text,
       ////   duration: duration + " ms",
        ////   rows: res.rowCount
        //// })
      }
      callback(err, res)
    })
  }
  static queryOne(text, params, callback) {
    return this.query(text, params, (err, res) => {
      callback(err, (res && res.rows.length ? res.rows[0] : null))
    })
  }
  static insert(text, params, callback) {
    return this.query(text + ' RETURNING *', params, (err, res) => {
      callback(err, (res && res.rows.length ? res.rows[0] : null))
    })
  }
  static update(text, params, callback) {
    return this.query(text + ' RETURNING *', params, (err, res) => {
      callback(err, (res && res.rows.length ? res.rows[0] : null))
    })
  }
  static buildWhere(filters, startIndex, value, queryCols) {
    let key = startIndex || 1;
    let $and = [];
    let columns = {};
    queryCols = queryCols || [];
    value = value || [];
    for (let i = 0; i < filters.length; i++) {
      let filter = filters[i],
        group = (filter.group || filter.key);
      if (!columns[group]) {
        columns[group] = [];
      }
      let column = columns[group];
      switch (filter.op) {
        case '$ilike_eq':
        case '$like_eq':
        case '$ilike':
        case '$like':
          if (filter.key == 'query') {
            for (let j = 0; j < queryCols.length; j++) {
              column.push(queryCols[j] + "::VARCHAR "+(filter.op.split('_').shift()=='$ilike'?'ilike':'like')+" $" + (key) + "");
            }
          } else {
            column.push(filter.key + "::VARCHAR "+(filter.op.split('_').shift()=='$ilike'?'ilike':'like')+" $" + (key) + "");
          }
          key++;
          if(filter.op.split('_').pop()=='eq'){
            value.push(filter.value);
          }else{
            value.push('%' + filter.value + '%');
          }
          break;
        case '$in':
        case '$nin':
          if (Array.isArray(filter.value) && filter.value.length) {
            let keySet = [];
            for (let j = 0; j < filter.value.length; j++) {
              keySet.push('$' + (key++));
              value.push(filter.value[j]);
            }
            if (filter.op === '$in') {
              column.push(filter.key + " IN(" + keySet.join(',') + ")");
            } else {
              column.push(filter.key + " NOT IN(" + keySet.join(',') + ")");
            }
          }
          break;
        case '$btn':
          if (Array.isArray(filter.value) && filter.value.length == 2) {
            column.push(filter.key + " between $" + (key++) + " AND $" + (key++) + "")
          }
          value.push(filter.value[0]);
          value.push(filter.value[1]);
          break;
        case '$gte':
          column.push(filter.key + " >= $" + (key++) + "");
          value.push(filter.value);
          break;
        case '$lte':
          column.push(filter.key + " <= $" + (key++) + "");
          value.push(filter.value);
          break;
        case '$gt':
          column.push(filter.key + " > $" + (key++) + "");
          value.push(filter.value);
          break;
        case '$lt':
          column.push(filter.key + " < $" + (key++) + "");
          value.push(filter.value);
          break;
        default:
          column.push(filter.key + " = $" + (key++) + "");
          value.push(filter.value);
          break;
      }

    }
    for (let key in columns) {
      if (Array.isArray(columns[key]) && columns[key].length) {
        $and.push("(" + columns[key].join(' OR ') + ")");
      }
    }
    let where = '';
    if ($and.length) {
      where = ' WHERE ' + $and.join(' AND ');
    }
    return {
      where,
      key
    };
  }
  static paginate(text, params, {
    sorts,
    query_columns,
    filters,
    page_size,
    page
  }, callback) {
    sorts=sorts ||[];
    page_size=page_size||10;
    page=page||1;
    page=(page-1)*page_size;
    let sortOrder=[];
    for(let key in sorts){
      if(key){
        sortOrder.push(key+' '+(sorts[key]>=0?'ASC':'DESC'));
      }
    }
    sortOrder=sortOrder.join();
    let me=this;
    let key=params.length+1;
    let resultWhere=me.buildWhere(filters || [],key,params,query_columns);
    let where=resultWhere.where;
    key=resultWhere.key;
    async.parallel({
      total_count:function(next){
        me.query('SELECT count(*) as count FROM ('+text+') as data '+where, params, (err, res) => {
          next(err, (res && res.rows.length ? Number(res.rows[0].count) : null))
        })
      },
      list:function(next){
        me.query('SELECT * FROM ('+text+') as data '+where+(sortOrder?' ORDER BY '+sortOrder:'')+' OFFSET $'+(key++)+' LIMIT $'+(key++), params.concat(page,page_size), (err, res) => {
          next(err, res?res.rows:null);
        })
      }
    },callback);
  }
  static getClient(callback){
    pool.connect((err, client, done) => {
      const query = client.query.bind(client)

      // monkey patch the query method to keep track of the last query executed
      // client.query = () => {
      //   client.lastQuery = arguments
      //   client.query.apply(client, arguments)
      // }

      // set a timeout of 5 seconds, after which we will log this client's last query
      const timeout = setTimeout(() => {
        ////console.error('A client has been checked out for more than 5 seconds!')
        ////console.error(`The last executed query on this client was: ${client.lastQuery}`)
      }, 5000)

      const release = (err) => {
        // call the actual 'done' method, returning this client to the pool
        done(err)

        // clear our timeout
        clearTimeout(timeout)

        // set the query method back to its old un-monkey-patched version
        client.query = query
      }

      callback(err, client, release)
    })
  }
}
class TX extends db{
  begin(next){
    let me=this;
    db.getClient(function(err,client,done){
      me.client=client;
      me.done=done;
      me.client.query('BEGIN',[],next);
    })
  }
  query(text,params,callback){
    this.client.query(text,params,callback);
  }
  queryOne(text,params,callback){
    return this.query(text , params, (err, res) => {
      callback(err, (res && res.rows.length ? res.rows[0] : null))
    })
  }
  insert(text,params,callback){
    return this.query(text + ' RETURNING *', params, (err, res) => {
      callback(err, (res && res.rows.length ? res.rows[0] : null))
    })
  }
  update(text,params,callback){
    return this.query(text + ' RETURNING *', params, (err, res) => {
      callback(err, (res && res.rows.length ? res.rows[0] : null))
    })
  }
  commit(cb){
    let me=this;
    if(me.client){
      this.query('COMMIT',[],(err)=>{
        me.done();
        cb(err);
      });
    }else{
      cb();
    }
  }
  rollback(cb){
    let me=this;
    if(me.client){
      this.query('ROLLBACK',[],(err)=>{
        me.done();
        cb(err);
      });
    }else{
      if(cb){
        cb();
      }
    }
  }
}
db.TX=TX;
module.exports = db;
