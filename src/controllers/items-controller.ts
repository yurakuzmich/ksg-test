import { Request, Response } from 'express';
import axios from 'axios';

export class ItemsController {
  public async getItems(req: Request, res: Response) {
    try {
        const tradableItemsResponse = await axios.get('https://api.skinport.com/v1/items', {params: {tradable: true}});
        const nonTradableItemsResponse = await axios.get('https://api.skinport.com/v1/items', {params: {tradable: false}});

        const itemsMap = new Map();

        tradableItemsResponse.data.forEach((item: any) => {
            itemsMap.set(item.market_hash_name, { ...item, min_tradable_price: item.min_price });
        });

        nonTradableItemsResponse.data.forEach((item: any) => {
            const existingItem = itemsMap.get(item.market_hash_name);
            if (existingItem) {
                existingItem.min_non_tradable_price = item.min_price;
            } else {
                itemsMap.set(item.market_hash_name, { ...item, min_non_tradable_price: item.min_price });
            }
        });

        const itemsResponse = Array.from(itemsMap.values());
        res.json(itemsResponse);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching data' });
    }
  }
}