import { CountryObj } from "../interface/country"
import * as redish from '../util/redis'
import countries from './country'
import { Request, Response } from "express"
import { Country } from '../types'
const KEY:string = "country" 

const getCountryList = (): Promise<Array<CountryObj>> =>
    new Promise((resolve, reject) => {
        let list: Array<CountryObj> = []
        countries()
            .then((res: Array<Country>) => {
                res.forEach((res: Country, i: number) => {
                    let obj: CountryObj = {
                        id: i + 1,
                        name: res.name,
                        code: res.code,
                        population: Math.floor(Math.random() * 1000000000)
                    }
                    list.push(obj);
                })
                resolve(list);
            }).catch(err => {
                reject();
            })
    })

const saveToRedis = (data:Array<CountryObj>)=>{
    let obj:any = {};
    for (const e of data) {
        obj[e.id] = e
  }
    redish.setData(KEY, obj)
}

const getRedishData = ():Promise<Array<CountryObj>>=>
new Promise((resolve,reject)=>{
    let data:Array<CountryObj> = [];
    redish.getData(KEY)
    .then((res:any)=>{
        let keys = Object.keys(res);
        for (const key of keys) {
              data.push(res[key]);
        }
        resolve(data);
    }).catch((err:any)=>{
        reject(err)
    })
})


export const populateList = (req:Request, res:Response)=> {
    getCountryList()
    .then(async(result:Array<CountryObj>) =>{
        await saveToRedis(result)
        return res.json(result)
    }).catch((err:any)=>{
        res.json('Please try again!')
    })
}
export const sortList = async(req:Request, res:Response) => {
    const cache = await getRedishData()|| null
    if (!cache) return res.json({message:"Please access /generate/list"})
    const sorting: string = req.params.sort as string || 'asc';
    const asc = sorting.toLowerCase() === 'asc';
    const decs = sorting.toLowerCase() === 'decs';
    if (asc) {
        cache.sort((a, b) => a.population - b.population);

    } else if (decs) {
        cache.sort((a, b) => b.population - a.population)
    }
    res.json(cache)
}

export const getByid= async(req:Request, res:Response) =>{
    const id:string = req.params.id as string;
    if (!id) return res.json({message:"id is required"});

    const cache =  await redish.getData(KEY) || null;
    if (!cache) return res.json({message:"Please access /generate/list"});
    if(!cache[id]) return res.json({message:`No data found on id: ${id}`});
    res.json(cache[id])
}

export const deleteByid= async(req:Request, res:Response) =>{
    const id:string = req.params.id as string;
    if (!id) return res.json({message:"id is required"});

    const cache =  await redish.getData(KEY) || null;
    if (!cache) return res.json({message:"Please access /generate/list"});
    if(!cache[id]) return res.json({message:`No data found on id: ${id}`});
    const data = {...cache[id]}
    delete cache[id]
    redish.setData(KEY,cache);
    res.json({message:'Successfully deleted',
                    data});

}
export const updateByid= async(req:Request, res:Response) =>{
    const id:string = req.params.id as string;
    if (!id) return res.json({message:"id is required"});

    const cache:any =  await redish.getData(KEY) || null;
    if (!cache) return res.json({message:"Please access /generate/list"});
    const cacheData:CountryObj = cache[id]
    if(!cacheData) return res.json({message:`No data found on id: ${id}`});
     
    const data:CountryObj = {
        name: req.body.name?req.body.name: cacheData.name,
        code: req.body.code?req.body.code: cacheData.code,
        id :cacheData.id,
        population: req.body.population? req.body.population: cacheData.code
    }
    cache[id] = data
    redish.setData(KEY, cache)
    res.json({message:'Successfully updated',
                    data});

}
     

 

