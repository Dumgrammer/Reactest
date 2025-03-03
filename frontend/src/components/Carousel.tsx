import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [
    "PE PANTS.png",
    "PE SHIRT.png",
    "GC POLO.png",
];

export default function Carousel() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Slider {...settings}>
                {images.map((src, index) => (
                    <div key={index} className="w-full h-[200px] md:h-[250px] lg:h-[300px] xl:h-[300px] flex items-center justify-center overflow-hidden">
                        <img src={src} alt={`Slide ${index + 1}`} className="w-full rounded-xl shadow-lg" />
                    </div>
                ))}
            </Slider>
        </div>
    );
}
