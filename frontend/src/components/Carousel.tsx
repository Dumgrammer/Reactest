import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [
    "banner-1.png",
    "banner-2.png",
    "CCS LACE.png",
];

const categories = [
    { name: "Clothing", icon: "fas fa-tshirt" },
    { name: "Footwear", icon: "fas fa-shoe-prints" },
    { name: "Accessories", icon: "fas fa-hat-cowboy" },
    { name: "Clothing", icon: "fas fa-tshirt" },
    { name: "Footwear", icon: "fas fa-shoe-prints" },
    { name: "Accessories", icon: "fas fa-hat-cowboy" },
];

export default function Carousel() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        arrows: true,
    };

    return (
        <>
        <form className="max-w-xl mb-4 mx-auto">   
    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
    <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-6 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input type="search" id="default-search" className="search block w-full p-4 ps-10 text-sm text-gray-900  bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Products..." required />
    </div>
</form>
        
        <div className="w-full">
                <Slider {...settings}>
                    {images.map((src, index) => (
                        <div key={index} className="w-full h-[200px] md:h-[250px] lg:h-[300px] xl:h-[300px] flex items-center justify-center overflow-hidden">
                            <img src={src} alt={`Slide ${index + 1}`} className="w-full rounded-xl shadow-lg" />
                        </div>
                    ))}
                </Slider>
            </div>
        <div className="w-full categories p-4">
            <div className="max-w-1/3 mx-auto">
                <h2 className="text-xl font-bold pl-6">Categories</h2>
                <div className="list">
    {categories.map((category, index) => (
        <div key={index} className="flex flex-col items-center p-6">
        <div className="bg-[#ebebeb] rounded-lg p-7 flex items-center justify-center w-10 h-10">
            <i className={category.icon + " text-2xl"}></i>
        </div>
        <span className="font-medium mt-2 text-[rgb(21 152 75)] text-center">{category.name}</span>
    </div>
    ))}
</div></div>
            </div>
            
        </>
    );
}