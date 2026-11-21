// Shows the item's image, or a plain fallback block when there is no image.
export default function ItemImage({ item }) {
  if (item.image) {
    return <img className="item-image" src={item.image} alt={item.name} loading="lazy" />;
  }
  // The name is already written next to it, so the fallback is decorative.
  return (
    <div className="item-image item-image-fallback" aria-hidden="true">
      {item.name.charAt(0)}
    </div>
  );
}
