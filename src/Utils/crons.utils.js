import { scheduleJob } from "node-schedule";
import { Coupon } from "../../DB/Models/index.js";
import { DateTime } from "luxon";

export const disableCouponCron = ()=>{
    scheduleJob('/5 * * * * *', async ()=>{  // /5 every 5 min
        const enabledCoupons = await Coupon.find({ isEnabled: true })

        if(enabledCoupons.length){
            for (const coupon of enabledCoupons){
                if(DateTime.now() > DateTime.fromJSDate(coupon.till)){
                    coupon.isEnabled= false
                    await coupon.save()
                }
            }
        }
        
    })
}