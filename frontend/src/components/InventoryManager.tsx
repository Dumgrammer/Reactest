import { useState, useEffect } from 'react';

interface InventoryItem {
    size: string;
    type: string;
    quantity: number;
}

interface InventoryManagerProps {
    sizes: string[];
    types: string[];
    inventory: InventoryItem[];
    onChange: (inventory: InventoryItem[]) => void;
}

const InventoryManager = ({ sizes, types, inventory, onChange }: InventoryManagerProps) => {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(inventory || []);

    // Initialize or update inventory when sizes or types change
    useEffect(() => {
        // Create a grid of all size and type combinations
        const newItems: InventoryItem[] = [];
        
        sizes.forEach(size => {
            types.forEach(type => {
                // Check if this combination already exists
                const existingItem = inventoryItems.find(
                    item => item.size === size && item.type === type
                );
                
                if (existingItem) {
                    newItems.push(existingItem);
                } else {
                    newItems.push({ size, type, quantity: 0 });
                }
            });
        });
        
        setInventoryItems(newItems);
        onChange(newItems);
    }, [sizes, types]);

    const handleQuantityChange = (size: string, type: string, quantity: number) => {
        const updatedItems = inventoryItems.map(item => 
            (item.size === size && item.type === type)
                ? { ...item, quantity }
                : item
        );
        
        setInventoryItems(updatedItems);
        onChange(updatedItems);
    };

    return (
        <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Inventory Management</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2 border-b border-r text-left">Size</th>
                            {types.map(type => (
                                <th key={type} className="px-4 py-2 border-b border-r text-center">
                                    {type}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sizes.map(size => (
                            <tr key={size} className="border-b">
                                <td className="px-4 py-2 border-r font-medium">{size}</td>
                                {types.map(type => {
                                    const item = inventoryItems.find(
                                        item => item.size === size && item.type === type
                                    );
                                    
                                    return (
                                        <td key={`${size}-${type}`} className="px-4 py-2 border-r text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                value={item?.quantity || 0}
                                                onChange={(e) => handleQuantityChange(
                                                    size,
                                                    type,
                                                    parseInt(e.target.value) || 0
                                                )}
                                                className="w-16 p-1 text-center border rounded"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50">
                            <td className="px-4 py-2 font-medium">Total</td>
                            {types.map(type => {
                                const total = inventoryItems
                                    .filter(item => item.type === type)
                                    .reduce((sum, item) => sum + item.quantity, 0);
                                
                                return (
                                    <td key={`total-${type}`} className="px-4 py-2 text-center font-medium">
                                        {total}
                                    </td>
                                );
                            })}
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="mt-2 text-right">
                <p className="text-sm text-gray-600">
                    Total stock: {inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
            </div>
        </div>
    );
};

export default InventoryManager; 