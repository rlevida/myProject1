import redis  from 'redis';
const client:any = redis.createClient({
    host: 'redis-server',
    port: 6379
})

client.on("connect", function() {
    console.log("You are now connected");
  });

  export const getData = (key:string): Promise<any> =>
   new Promise((resolve,reject)=>{
    if(client.connected) {
        client.get(key, (err:any, data:any)=>{
            if(err) {
                reject(err)
            } else {
                if (data) {
                    if (data.startsWith("{") || data.startsWith("[")) {
                        try {
                            resolve(JSON.parse(data))
                        } catch (error) {
                            resolve(data)
                        }
                    } else {
                        resolve(data)
                    }
                } else {
                    resolve(null)
                }
            }
        })
    }
   })

   export const setData = (key:string, value:any): Promise<any>=>
   new Promise((resolve,reject)=>{
    if (client.connected) {
        let stringValue = ''

        if (typeof value === 'string') {
            stringValue = value
        } else {
            stringValue = JSON.stringify(value);
        }

        client.set(key, stringValue, (error:string, reply:any) => {
            if (error) {
                reject(error)
            }
            resolve(true)
        })
    } else {
        resolve(false)
    }
   })

   
    
  