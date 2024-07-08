export type EventName =
	| 'order_created'
	| 'order_refunded'
	| 'subscription_cancelled'
	| 'subscription_created'
	| 'subscription_updated'
	| 'subscription_expired'
	| 'subscription_payment_success'

export type TypeMeta = {
	test_mode: boolean
	event_name: EventName
	custom_data: {
		user_id: string
	}
	webhook_id: string
}

export type TypeEvent = {
	meta: TypeMeta
	data: {
		type: 'subscriptions' | 'orders'
		id: string
		attributes: {
			store_id: number
			customer_id: number
			order_id: number
			order_item_id: number
			product_id: number
			variant_id: number
			product_name: string
			variant_name: string
			user_name: string
			user_email: string
			status: 'active' | 'cancelled' | 'unpaid' | 'expired'
			cancelled: boolean
			renews_at: Date | null
			ends_at: Date | null
			created_at: Date
		}
	}
}

export type TypeInvoiceEvent = {
	meta: TypeMeta
	data: {
		type: 'subscription-invoices'
		id: string
		attributes: {
			store_id: number
			subscription_id: number
			customer_id: number
			user_name: string
			user_email: string
			billing_reason: 'initial' | 'renewal' | 'updated'
			status: 'pending' | 'paid' | 'void' | 'refunded'
			refunded: boolean
			subtotal: number
			tax: number
			total: number
			created_at: Date
			updated_at: Date
		}
	}
}

export type TypeOrderEvent = {
	meta: TypeMeta
	data: {
		type: 'orders'
		id: string 
		attributes: {
			store_id: number
			customer_id: number
			user_name:string
			user_email:string 
			status: 'pending' | 'paid' | 'void' | 'refunded'
			refunded: boolean

			subtotal: number
			tax: number
			total: number
			first_order_item: {
				id: number
				order_id:number 
				product_id:number
				variant_id:number 
				price: number
			}
		}
	}
}
