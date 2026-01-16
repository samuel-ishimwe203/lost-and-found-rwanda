import { useLocation } from "react-router-dom";

const items = [
  {
    id: 1,
    title: "National ID Card",
    city: "Kigali",
    category: "National ID",
    reward: "20,000 RWF",
  },
  {
    id: 2,
    title: "Rwandan Passport",
    city: "Huye",
    category: "Passport",
    reward: "50,000 RWF",
  },
  {
    id: 3,
    title: "Driving License",
    city: "Musanze",
    category: "Driving License",
    reward: "15,000 RWF",
  },
  {
    id: 4,
    title: "ATM Card",
    city: "Kigali",
    category: "ATM Card",
    reward: "10,000 RWF",
  },
];

export default function AllPostings() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const city = params.get("city");
  const category = params.get("category");
  const title = params.get("title");

  const filteredItems = items.filter((item) => {
    return (
      (!city || item.city === city) &&
      (!category || item.category === category) &&
      (!title || item.title.toLowerCase().includes(title.toLowerCase()))
    );
  });

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">
        Search Results
      </h2>

      {filteredItems.length === 0 ? (
        <p>No items found for the selected district.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl shadow"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500">
                City: {item.city}
              </p>
              <p className="text-green-700 font-bold mt-2">
                Reward: {item.reward}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
