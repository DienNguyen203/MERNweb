
import { useParams } from 'react-router-dom';
import './EditProduct.css'; 
// import upload_area from '../../assets/upload_area.svg'
import { useState } from 'react';
import { useEffect } from 'react';

const EditProduct = () => {
  const { ObjectId } = useParams();
  // const [image, setImage] = useState(false)
  const [productDetails, setProductDetails] = useState({
    name: '',
    image: '',
    category: '',
    new_price: '',
    old_price: '',
  });
  console.log(ObjectId);
  useEffect(() => {
    // Fetch product details based on productId
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/allproducts/${ObjectId}`);
        const data = await response.json();
        console.log(data);
        if (data) {
          // Update the state with fetched product details
          setProductDetails({
            name: data.name,
            image: data.image,
            category: data.category,
            new_price: data.new_price,
            old_price: data.old_price,
          });
        } else {
          console.error('Failed to fetch product details');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();
  }, [ObjectId]);

  // const imageHandler = (e) => {
  //   setImage(e.target.files[0]);
  // };

  const chaneHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const editProduct = async () => {
    try {
      const response = await fetch(`http://localhost:4000/editproduct/${ObjectId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productDetails),
      });

      const data = await response.json();

      if (data) {
        alert('Product Edited');
      } else {
        alert('Failed');
      }
    } catch (error) {
      console.error('Error editing product:', error);
    }
  };

  return (
    <div className="add-product">
      <h2>Update Product</h2>
        <div className="addproduct-itemfeild">
            <p>Product title</p>
            <input value={productDetails.name} onChange={chaneHandler} type='text' name='name' placeholder='Type here'/>
        </div>
        <div className="addproduct-price">
            <div className="addproduct-itemfeild">
                <p>Price</p>
                <input value={productDetails.old_price} onChange={chaneHandler} type="text" name='old_price' placeholder='Type here'/>
            </div>
            <div className="addproduct-itemfeild">
                <p>Offer Price</p>
                <input value={productDetails.new_price} onChange={chaneHandler} type="text" name='new_price' placeholder='Type here'/>
            </div>
        </div>
        <div className="addproduct-itemfeild">
            <p>Product Category</p>
            <select value={productDetails.category} onChange={chaneHandler} name="category" className='add-product-selector'>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kid">Accessory</option>
            </select>
        </div>
        <button onClick={()=>{editProduct()}} className='addproduct-btn'>UPDATE</button>
    </div>
  )
};

export default EditProduct;


