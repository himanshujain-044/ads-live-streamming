import {
  product1Image,
  product2Image,
  product3Image,
} from "../../static/images";

const ProductPart = () => {
  return (
    <div>
      <div>
        <div>
          <div>
            <input
              type="radio"
              id="carousel-1"
              name="carousel"
              aria-hidden="true"
              hidden=""
              checked="checked"
            />
            <div id="carousel-1">
              <div>
                <img src={product1Image} alt="test" />
              </div>
              <div>
                <p>Men Regular Fit Solid Collar Casual Shirt</p>
                <p>$10</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries
                </p>
              </div>
            </div>
            <input
              type="radio"
              id="carousel-2"
              name="carousel"
              aria-hidden="true"
              hidden=""
            />
            <div id="carousel-2">
              <div>
                <img src={product2Image} alt="test" />
              </div>
              <div>
                <p>Humans - Men Oversized Tshirt</p>
                <p>$15</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries
                </p>
              </div>
            </div>
            <input
              type="radio"
              id="carousel-3"
              name="carousel"
              aria-hidden="true"
              hidden=""
            />
            <div id="carousel-3">
              <div>
                <img src={product3Image} alt="test" />
              </div>
              <div>
                <p>Skream - Men Oversized Tshirt</p>
                <p>$12</p>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries
                </p>
              </div>
            </div>
            <label for="carousel-3">‹</label>
            <label for="carousel-2">›</label>
            <label for="carousel-1">‹</label>
            <label for="carousel-3">›</label>
            <label for="carousel-2">‹</label>
            <label for="carousel-1">›</label>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuyNowButtonPart = () => {
  return (
    <div>
      <button
        onClick={() => {
          console.log("hii");
        }}
      >
        Buy Now
      </button>
    </div>
  );
};

const ECommercePanel = ({ panelHeight }) => {
  const Height = panelHeight;

  return (
    <div style={{ height: Height }}>
      <div>
        <ProductPart />
        <BuyNowButtonPart />
      </div>
    </div>
  );
};

export default ECommercePanel;
