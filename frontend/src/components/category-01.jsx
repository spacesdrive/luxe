import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
	{
		id: 1,
		title: "Electronics",
		count: "Gadgets & tech",
		slug: "electronics",
		image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1801&auto=format&fit=crop",
	},
	{
		id: 2,
		title: "Clothing",
		count: "Style & fashion",
		slug: "clothing",
		image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2940&auto=format&fit=crop",
	},
	{
		id: 3,
		title: "Accessories",
		count: "Bags & more",
		slug: "accessories",
		image: "https://images.unsplash.com/photo-1473188588951-666fce8e7c68?q=80&w=1748&auto=format&fit=crop",
	},
	{
		id: 4,
		title: "Jewelry",
		count: "Fine jewelry",
		slug: "jewelry",
		image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1740&auto=format&fit=crop",
	},
	{
		id: 5,
		title: "Home",
		count: "Décor & living",
		slug: "home",
		image: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1740&auto=format&fit=crop",
	},
	{
		id: 6,
		title: "Fragrance",
		count: "Scents & parfums",
		slug: "fragrance",
		image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=1804&auto=format&fit=crop",
	},
];

export function CategoryOne() {
	return (
        <section className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div
                className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 lg:mb-10">
				<div className="flex flex-col gap-1">
					<h2 className="font-bold text-4xl">
						Shop by Category
					</h2>
					<p className="font-normal text-sm lg:text-base text-muted-foreground">
						Browse our diverse collection of premium products.
					</p>
				</div>

				<Button className="group" asChild>
					<Link to="/shop">View all categories <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" /></Link>
				</Button>
			</div>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{categories.map((category) => (
					<Link key={category.id} to={`/shop/${category.slug}`}>
						<CategoryCard
	                        title={category.title}
	                        count={category.count}
	                        imageSrc={category.image} />
					</Link>
				))}
			</div>
        </section>
    );
}

export function CategoryCard({
    title,
    count,
    imageSrc,
    className
}) {
	return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl cursor-pointer h-56 flex flex-col justify-end will-change-transform",
            className
        )}>
            <div className="absolute inset-0">
				<img
                    src={imageSrc}
                    alt={title}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
			</div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="bottom-0 left-0 p-[24px] w-full flex items-end justify-between gap-4 relative">
				<div className="shrink-0">
					<h3 className="text-zinc-100 text-2xl font-semibold">{title}</h3>
					<p className="text-white/90 font-medium text-sm">{count}</p>
				</div>
				<div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-300 ease-out">
					<ArrowRight className="w-4 h-4" strokeWidth={2} />
				</div>
			</div>
        </div>
    );
}
