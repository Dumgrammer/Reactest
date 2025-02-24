import { useDispatch } from "react-redux";
import { removeItemToCartAction, addToCartAction } from "../Redux/Actions/Cart";
import { AppDispatch } from "../Redux/Store";

export default function CartItems({ cartItems }: any) {
    
    const dispatch = useDispatch<AppDispatch>();
    
    const removeFromCartHandler = (id: string) => {
        dispatch(removeItemToCartAction(id))
    }

    const addToCartHandler = (id: string, quantity: number) => {
        dispatch(addToCartAction(id, quantity))
    }

    return (
        <div className="mt-8">
            <div className="flow-root">
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                    {cartItems.map((product: any) => (
                        <li key={product.id} className="flex py-6">
                            <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img alt={product.imageAlt} src={product.image} className="size-full object-cover" />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                            <a href={product.href}>{product.name}</a>
                                        </h3>
                                        <p className="ml-4">{product.price}</p>
                                    </div>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">Qty
                                        <select value={product.quantity}
                                            onChange={(count: any) => addToCartHandler(product.product, Number(count.target.value))}
                                            className="rounded border ml-2 appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">

                                            {
                                                Array.from({ length: product.countInStock }, (_, i) => i + 1).map((x) => (
                                                    <option key={x} value={x}>{x}</option>
                                                ))
                                            }



                                        </select></p>

                                    <div className="flex">
                                        <button onClick={() => removeFromCartHandler(product.product)} type="button" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}