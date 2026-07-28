import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { CartContext } from '../context/CartContext'
import { addressService, orderService } from '../services/otherServices'
import styles from './CheckoutPage.module.css'

const addressSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  postalCode: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
})

export default function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext)
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(addressSchema)
  })

  useEffect(() => {
    addressService.getAddresses().then(addrs => {
      setAddresses(addrs)
      const def = addrs.find(a => a.isDefault) || addrs[0]
      if (def) setSelectedAddress(def.id)
      else setShowNewForm(true)
    })
  }, [])

  const placeWithExisting = async () => {
    if (!selectedAddress) { setError('Please select an address'); return }
    setError('')
    setPlacing(true)
    try {
      const order = await orderService.placeOrder({ addressId: selectedAddress })
      clearCart()
      navigate(`/order-confirmation/${order.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order')
      setPlacing(false)
    }
  }

  const placeWithNewAddress = async (addrData) => {
    setError('')
    setPlacing(true)
    try {
      const newAddr = await addressService.addAddress({ ...addrData, isDefault: false })
      const order = await orderService.placeOrder({ addressId: newAddr.id })
      clearCart()
      navigate(`/order-confirmation/${order.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order')
      setPlacing(false)
    }
  }

  const shipping = 5.99
  const total = (cart.subtotal || 0) + shipping

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className={styles.layout}>
          {/* Address Section */}
          <div className={styles.left}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Shipping Address</h2>

              {addresses.length > 0 && (
                <div className={styles.addressList}>
                  {addresses.map(addr => (
                    <label key={addr.id} className={`${styles.addressCard} ${selectedAddress === addr.id ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => { setSelectedAddress(addr.id); setShowNewForm(false) }}
                      />
                      <div className={styles.addressText}>
                        <strong>{addr.fullName}</strong>
                        {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                        <p>{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                        <p>{addr.country}</p>
                      </div>
                    </label>
                  ))}

                  <button
                    className={`btn btn-outline btn-sm ${styles.addAddrBtn}`}
                    onClick={() => { setShowNewForm(!showNewForm); setSelectedAddress(null) }}
                  >
                    {showNewForm ? '← Use saved address' : '+ Add new address'}
                  </button>
                </div>
              )}

              {showNewForm && (
                <form id="checkout-form" onSubmit={handleSubmit(placeWithNewAddress)} className={styles.addrForm}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input {...register('fullName')} className={`form-input ${errors.fullName ? 'error' : ''}`} />
                    {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input {...register('street')} className={`form-input ${errors.street ? 'error' : ''}`} />
                    {errors.street && <span className="form-error">{errors.street.message}</span>}
                  </div>
                  <div className={styles.row3}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input {...register('city')} className={`form-input ${errors.city ? 'error' : ''}`} />
                      {errors.city && <span className="form-error">{errors.city.message}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input {...register('state')} className={`form-input ${errors.state ? 'error' : ''}`} />
                      {errors.state && <span className="form-error">{errors.state.message}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Code</label>
                      <input {...register('postalCode')} className={`form-input ${errors.postalCode ? 'error' : ''}`} />
                      {errors.postalCode && <span className="form-error">{errors.postalCode.message}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input {...register('country')} className={`form-input ${errors.country ? 'error' : ''}`} defaultValue="United States" />
                    {errors.country && <span className="form-error">{errors.country.message}</span>}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className={styles.right}>
            <div className={styles.summary}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>

              <div className={styles.items}>
                {cart.items?.map(item => (
                  <div key={item.cartItemId} className={styles.item}>
                    <span className={styles.itemName}>{item.productName} × {item.quantity}</span>
                    <span>${item.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.totals}>
                <div className={styles.totalLine}>
                  <span>Subtotal</span>
                  <span>${(cart.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className={styles.totalLine}>
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className={`${styles.totalLine} ${styles.grandTotal}`}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {showNewForm ? (
                <button
                  type="submit"
                  form="checkout-form"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={placing}
                >
                  {placing ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={placeWithExisting}
                  disabled={placing || !selectedAddress}
                >
                  {placing ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
                </button>
              )}

              <p className={styles.secure}>🔒 Secure checkout — demo mode (no payment required)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
