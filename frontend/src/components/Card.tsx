export default function Card({ children }: { children: React.ReactNode }) {
    return (

        <div className="block max-w-7xl max-h-lg p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            <main>{children}</main>
        </div>

    )
}