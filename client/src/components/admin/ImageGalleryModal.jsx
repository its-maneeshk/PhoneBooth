export default function ImageGalleryModal({ images, onClose }) {
  if (!images?.length) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600"
        >
          ✕
        </button>
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="w-full h-32 object-cover rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
