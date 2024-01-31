import React, { useContext, useState } from 'react'
import './Payment.css'
import { ShopContext } from '../../Context/ShopContext'
import { Link } from 'react-router-dom';
// import remove_icon from '../Assets/cart_cross_icon.png'
// import { Link } from 'react-router-dom';

const Checkout = () => {
    const { all_product, cartItems } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        address: "",
        cartItems: [{
            id: String,
            new_price: Number,
            image: String,
            category: String,
            date: Date
        }],
    })

    const NameHandler = (e) => {
        console.log(formData);
        setFormData({ ...formData, name: e.target.value });
    }

    const NumberHandler = (e) => {
        console.log(formData);
        setFormData({ ...formData, phoneNumber: e.target.value });
    }

    const AddressHandler = (e) => {
        console.log(formData);
        setFormData({ ...formData, address: e.target.value });
    }


    const handleCheckout = async (event) => {
        // event.preventDefault();
        console.log(formData);
        try {
            await fetch('http://localhost:4000/api/Payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            window.location.reload();
            // Add any further logic or redirection upon successful checkout
        } catch (error) {
            console.error('Error during checkout:', error);
        }
        event.preventDefault();
    };

    return (
        <div className="checkout">
            <div className='cartitems'>
                <div className="cartitems-format-main">
                    <p>Products</p>
                    <p>Title</p>
                    <p>Price</p>
                    <p>Quantity</p>
                    <p>Total</p>
                </div>
                <hr />
                {all_product.map((e) => {
                    if (cartItems[e.id] > 0) {
                        return <div>
                            <div className="cartitems-format cartitems-format-main">
                                <img src={e.image} alt="" className='carticon-product-icon' />
                                <p>{e.name}</p>
                                <p>${e.new_price}</p>
                                <button className='cartitems-quantity'>{cartItems[e.id]}</button>
                                <p>${e.new_price * cartItems[e.id]}</p>
                            </div>
                            <hr />
                        </div>
                    }

                    return null;
                })}
            </div>
            <div className="info-user">
                <h2>Delivery Infomation</h2>
                <form action="">
                    <div className="name">
                        <input onChange={NameHandler} type="text" placeholder='Your name' />
                    </div>
                    <div className="phoneNumber">
                        <input onChange={NumberHandler} type="text" placeholder='Your phone number' />
                    </div>
                    <div className="address">
                        <input onChange={AddressHandler} type="text" placeholder='Your address' />
                    </div>

                    <div className="pay-method">
                        <p>Pay method</p>
                        <div className="pay-method-row1">
                            <img src="https://hstatic.net/0/0/global/design/seller/image/payment/cod.svg?v=6" alt="" />
                            <p>COD</p>
                        </div>
                        <div className="pay-method-row1">
                            <img src="https://hstatic.net/0/0/global/design/seller/image/payment/other.svg?v=6" alt="" />
                            <p>COD</p>
                        </div>
                        <div className="pay-method-row1">
                            <img src="https://hstatic.net/0/0/global/design/seller/image/payment/momo.svg?v=6" alt="" />
                            <p>COD</p>
                        </div>
                        <Link to='/PaymentSuccessfull'><button onClick={handleCheckout}>Check Out</button></Link>

                    </div>
                </form>

            </div>
        </div>

    )
}

export default Checkout