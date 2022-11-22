import React, { useCallback, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import DeliveryAddress from "../../Components/Pay/DeliveryAddress";
import { useDispatch, useSelector } from "react-redux";
import {
  addressApiSelector,
  getFeeServiceApi,
  getLeadTimeApi,
  getServicePackageApi,
  handleResetFeeServiceChange,
} from "../../Store/Reducer/apiAddress";
import ProductsPay from "../../Components/Pay/ProductPay";
import { useHistory, useParams } from "react-router";
import ScaleLoader from "react-spinners/ScaleLoader";
import Payment from "../../Components/Pay/Payment/Payment";
import Helmet from "../../Components/Helmet";
import { message } from "antd";
import PayMethod from "../../Components/Pay/PayMethod";
import { cartSelector } from "../../Store/Reducer/cartReducer";
import { authSelector } from "../../Store/Reducer/authReducer";
import {
  getUserAddress,
  getUserAddressAdmin,
  insertUserAddress,
  updateStatusUserAddress,
  updateUserAddress,
  userAddressSelector,
} from "../../Store/Reducer/userAddressReducer";

import {
  loadingSelector,
  setLoadingAction,
} from "../../Store/Reducer/loadingReducer";
import {
  createPayment,
  handleResetUrl,
  paymentSelector,
} from "../../Store/Reducer/paymentReducer";
import {
  handleAddOrder,
  orderSelector,
} from "../../Store/Reducer/orderReducer";
import { isEmptyObject } from "../../utils";
const PayComponent = styled.div``;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  transition: display 0.5s ease;
`;

const messageToCart = (status, text) => {
  if (status) {
    message.success({
      content: text,
      className: "custom-class",
      style: {
        marginTop: "0vh",
      },
    });
  } else {
    message.error({
      content: text,
      className: "custom-class",
      style: {
        marginTop: "0vh",
      },
    });
  }
};

function Pay({ axiosJWT }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { linkText } = useParams();
  // data auth.user && auth.token
  const auth = useSelector(authSelector);
  // data address api
  const address_api = useSelector(addressApiSelector);
  // data cart products
  const cartProducts = useSelector(cartSelector);
  // data user address
  const userAddressSlt = useSelector(userAddressSelector);
  const loading = useSelector(loadingSelector);
  const payment = useSelector(paymentSelector);
  const orderSlt = useSelector(orderSelector);

  const [sumProduct, setSumProduct] = useState("");
  const [products, setProducts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState("Content of the modal");
  const [valueAddress, setvalueAddress] = useState({
    tinh: null,
    quan: null,
    xa: null,
    mota: null,
  });
  const [objAddress, setObjAddress] = useState({
    tinh: null,
    quan: null,
    xa: null,
    mota: null,
  });
  const [inputName, setInputName] = useState("");
  const [inputNumber, setInputNumber] = useState("");
  const [changeCheckbox, setChangeCheckbox] = useState(false);
  const [payMethod, setPayMethod] = useState("");
  const [isShowTablePay, setIsShowTablePay] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [message, setMessage] = useState("");
  const [userAddressDefault, setUserAddressDefault] = useState(null);
  const [address_user_api, setAddress_user_api] = useState(null);
  const [payMethodActive, setPayMethodActive] = useState(null);
  const [isRedirectToSuccessPage, setIsRedirectToSuccessPage] = useState(false);
  const [feeService, setFeeServince] = useState("");
  const [serviceFee, setServiceFee] = useState(null);
  const [serviceTypeId, setServiceTypeId] = useState(null);
  const [lngLat, setLngLat] = useState({ long: 0, lat: 0 });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const result = [];

  const { order, isError } = orderSlt;

  const { paymentUrl } = payment;

  const { servicePackage, leadTime, feeServiceChange } = address_api;

  const { userAddress, userAddressAdmin } = userAddressSlt;

  useEffect(() => {
    if (auth.tokenAuth && auth.user) {
      dispatch(getUserAddress({ userId: auth.user._id }));
      dispatch(getUserAddressAdmin());
    } else {
      history.push("/buyer/signin");
    }
  }, [auth, history, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(handleResetUrl());
    };
  }, [dispatch]);

  useEffect(() => {
    if (paymentUrl) {
      const newWindow = window.open(paymentUrl, "_self", "noopener,noreferrer");
      if (newWindow) newWindow.opener = null;
      dispatch(setLoadingAction(false));
    }
  }, [dispatch, paymentUrl]);

  useEffect(() => {
    if (userAddress) {
      if (!userAddress?.items.length) {
        setVisible(true);
      } else {
        userAddress?.items.forEach((item) => {
          if (item.status) {
            setObjAddress(item.address);
            setvalueAddress(item.address);
            setAddress_user_api(item);
            item && setInputName(item.username || "");
            item && setInputNumber(item.phoneNumber || "");
            if (item.geolocation) {
              setLngLat({
                long: item.geolocation.coordinates[0] || 0,
                lat: item.geolocation.coordinates[1] || 0,
              });
            }
          }
        });
        setVisible(false);
      }
    } else {
      setVisible(true);
    }
  }, [dispatch, userAddress]);

  useEffect(() => {
    if (products) {
      const sumValues = products.reduce((accumulator, item) => {
        return accumulator + Number(item.price) * item.qty;
      }, 0);
      setSumProduct(sumValues);
    }
  }, [products]);

  useEffect(() => {
    if (cartProducts) {
      const { items } = cartProducts.cart;
      let arrText = linkText.split("+");
      const payProducts = [];

      arrText.forEach((text) => {
        if (text) {
          items.forEach((item) => {
            text === item._id && payProducts.push(item);
          });
        }
      });

      setProducts(payProducts);
      if (!payProducts.length) {
        history.push("/cart");
      }
    }
  }, [cartProducts, linkText, history]);

  useEffect(() => {
    if (isRedirectToSuccessPage) {
      if (payMethod === "Thanh Toán Khi Nhận Hàng") {
        if (products) {
          if (order) {
            if (!isError) {
              const stringItemId = products.reduce((string, product) => {
                return string + "-" + product._id;
              }, "");
              history.push(
                `/order/success/${order._id}?username=${inputName}&productsId=${stringItemId}&isPayment=false`
              );
            } else {
              history.push(`/order/cancel`);
            }
          }
        }
      }
    }
  }, [
    history,
    inputName,
    isError,
    isRedirectToSuccessPage,
    order,
    payMethod,
    products,
  ]);

  const showModal = () => {
    setVisible(true);
  };

  const handleChangeInputName = (e) => {
    setInputName(e.target.value);
  };

  const handleChangeInputNumber = (e) => {
    setInputNumber(e.target.value);
  };

  const handleOk = useCallback(() => {
    setModalText("The modal will be closed after two seconds");
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      let o = Object.fromEntries(
        Object.entries({
          tinh: objAddress.tinh || valueAddress.tinh,
          quan: objAddress.quan || valueAddress.quan,
          xa: objAddress.xa || valueAddress.xa,
          mota: objAddress.mota || valueAddress.mota,
          name_user: inputName,
          number_phone: inputNumber,
          status: changeCheckbox,
          long: lngLat.long,
          lat: lngLat.lat,
        })
      );

      const isEmpty = Object.values(o).some((x) => x === null || x === "");
      if (isEmpty) {
        messageToCart(false, "Lỗi Khi Tải Dữ Liệu Lên!");
      } else {
        if (changeCheckbox) {
          messageToCart(true, "Đã Tải Thành Công Địa Chỉ Mặc Định");
        } else {
          setvalueAddress({ ...objAddress, ...o });
          messageToCart(true, "Đã Tải Thành Công Địa Chỉ Tạm Thời");
        }
        const address = {
          tinh: o.tinh,
          quan: o.quan,
          xa: o.xa,
          mota: o.mota,
        };
        const data = {
          username: inputName,
          phoneNumber: inputNumber,
          address,
          status: true,
          tokenAuth: auth.tokenAuth,
          long: lngLat.long,
          lat: lngLat.lat,
          axiosJWT,
        };

        if (address_user_api) {
          if (
            (address_user_api._id &&
              o.tinh !== address_user_api.address.tinh &&
              o.quan !== address_user_api.address.quan &&
              o.xa !== address_user_api.address.xa) ||
            o.mota !== address_user_api.address.mota ||
            inputName !== address_user_api.username ||
            inputNumber !== address_user_api.phoneNumber
          ) {
            dispatch(
              updateUserAddress({
                data,
                userAddressId: address_user_api._id,
              })
            );
          } else {
            if (userAddressDefault) {
              if (userAddressDefault !== address_user_api._id) {
                dispatch(
                  updateStatusUserAddress({
                    tokenAuth: auth.tokenAuth,
                    userAddressId: userAddressDefault,
                    axiosJWT,
                  })
                );
              }
            }
          }
        } else {
          dispatch(insertUserAddress(data));
        }
        dispatch(handleResetFeeServiceChange());
      }
      setChangeCheckbox(false);
      setUserAddressDefault(null);
      setVisible(false);
    }, 1000);
  }, [
    address_user_api,
    auth.tokenAuth,
    axiosJWT,
    changeCheckbox,
    dispatch,
    inputName,
    inputNumber,
    lngLat.lat,
    lngLat.long,
    objAddress,
    userAddressDefault,
    valueAddress,
  ]);

  const onHandleValueImportAddress = (obj) => {
    setObjAddress(obj);
  };

  useEffect(() => {
    if (userAddress) {
      if (userAddressAdmin) {
        if (userAddress?.items.length) {
          userAddress?.items.forEach((item) => {
            if (item.status) {
              dispatch(
                getServicePackageApi({
                  toDistrict: item.address.quan.DistrictID,
                  fromDistrict: userAddressAdmin.address.quan.DistrictID,
                })
              );
            }
          });
        }
      }
    }
  }, [userAddress, userAddressAdmin, dispatch]);

  useEffect(() => {
    if (servicePackage?.data) {
      if (address_user_api) {
        if (products) {
          servicePackage.data.forEach((item) => {
            if (item) {
              if (!item.total) {
                const data = {
                  toDistrict: address_user_api.address.quan.DistrictID,
                  serviceTypeId: item.service_type_id,
                  toWardCode: address_user_api.address.xa.WardCode,
                  coupon: null,
                  products,
                  fromDistrict: userAddressAdmin.address.quan.DistrictID,
                  sumProduct,
                };
                dispatch(getFeeServiceApi(data));
              } else {
                dispatch(
                  getLeadTimeApi({
                    toDistrictId: address_user_api.address.quan.DistrictID,
                    toWardCode: address_user_api.address.xa.WardCode,
                    serviceId: item.service_id,
                    fromDistrict: userAddressAdmin.address.quan.DistrictID,
                  })
                );
              }
            }
          });
        }
      }
    }
  }, [
    servicePackage,
    dispatch,
    address_user_api,
    products,
    sumProduct,
    userAddressAdmin,
  ]);

  useEffect(() => {
    if (servicePackage) {
      servicePackage.data?.forEach((item) => {
        feeServiceChange.forEach((ele) => {
          if (item.service_type_id === ele.serviceTypeId) {
            result.push({ ...item, ...ele });
          }
        });
      });
    }
    const x = result.filter((obj, index, arr) => {
      return (
        arr
          .map((mapObj) => mapObj.service_type_id)
          .indexOf(obj.serviceTypeId) === index
      );
    });
    if (x) setServiceFee(x);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeServiceChange, servicePackage]);

  const handleCancel = () => {
    if (userAddress) {
      if (!userAddress.items.length) {
        history.push(`/cart`);
      } else {
        if (address_user_api) {
          setInputName(address_user_api.username || "");
          setInputNumber(address_user_api.phoneNumber || "");
        }
        setVisible(false);
        setChangeCheckbox(false);
      }
    } else {
      history.push(`/cart`);
    }
  };

  function onChangeCheckbox(e) {
    setChangeCheckbox(e.target.checked);
  }

  const handleChangeMethodPayProduct = (method) => {
    setPayMethod(method);
  };

  const handleMethodPayProduct = useCallback(() => {
    if (!isError) {
      if (!isEmptyObject(valueAddress || {})) {
        if (payMethod === "Thanh toán Online") {
          if (payMethodActive) {
            if (feeService) {
              switch (payMethodActive.title) {
                case "PayPal":
                  dispatch(setLoadingAction(true));
                  dispatch(
                    createPayment({
                      products,
                      email: auth.user.email,
                      message,
                      paymentFee: feeService,
                      serviceTypeId,
                    })
                  );
                  break;
                default:
              }
            }
          }
        } else if (payMethod === "Thanh Toán Khi Nhận Hàng") {
          if (auth.tokenAuth) {
            if (products.length) {
              const productsId = [];
              products.forEach((product) => {
                productsId.push(product._id);
              });
              if (productsId.length) {
                if (userAddress.items.length) {
                  if (feeService) {
                    userAddress.items.forEach((item) => {
                      if (item.status) {
                        dispatch(setLoadingAction(true));
                        dispatch(
                          handleAddOrder({
                            tokenAuth: auth.tokenAuth,
                            username: item.username,
                            phoneNumber: item.phoneNumber,
                            city: item.address,
                            productsID: productsId,
                            isPayment: false,
                            paymentFee: feeService,
                            serviceTypeId,
                            message,
                            axiosJWT,
                          })
                        );
                        setIsRedirectToSuccessPage(true);
                      }
                    });
                  }
                }
              }
            }
          }
        } else {
          messageToCart(
            false,
            "Xin Lỗi, Vui Lòng Chọn Phương Thức Thanh Toán Trước Khi Đặt Hàng!"
          );
        }
      }
    } else {
      messageToCart(
        false,
        "Xin Lỗi, Bạn Chưa Có Địa Chỉ Mặc Định, Vui Lòng Nhập Lại!"
      );
    }
  }, [
    auth,
    axiosJWT,
    dispatch,
    feeService,
    isError,
    message,
    payMethod,
    payMethodActive,
    products,
    serviceTypeId,
    userAddress,
    valueAddress,
  ]);

  const handleShowPayTable = (method) => {
    if (method === "Thanh toán Online") {
      setIsShowTablePay(!isShowTablePay);
    } else {
      setIsShowTablePay(false);
      setShowPayPal(false);
    }
  };

  const handleIntegrate = (item) => {
    if (item.title) {
      setShowPayPal(true);
      setPayMethodActive(item);
      setIsShowTablePay(false);
    }
  };

  const handleChangeMessage = (e) => {
    setMessage(e.target.value);
  };

  // End
  return (
    <Helmet title="Payment">
      {loading && (
        <div className="loading__container">
          <ScaleLoader
            color={"#2963B3"}
            loading={loading}
            css={override}
            size={200}
          />
        </div>
      )}

      <PayComponent>
        <DeliveryAddress
          address_api={address_api}
          loading={loading}
          visible={visible}
          confirmLoading={confirmLoading}
          valueAddress={valueAddress}
          showModal={showModal}
          handleOk={handleOk}
          handleCancel={handleCancel}
          modalText={modalText}
          onHandleValueImportAddress={onHandleValueImportAddress}
          objAddress={objAddress}
          inputName={inputName}
          inputNumber={inputNumber}
          handleChangeInputName={handleChangeInputName}
          handleChangeInputNumber={handleChangeInputNumber}
          onChangeCheckbox={onChangeCheckbox}
          userAddress={userAddress}
          address_user_api={address_user_api}
          setUserAddressDefault={setUserAddressDefault}
          userAddressDefault={userAddressDefault}
          lngLat={lngLat}
          setLngLat={setLngLat}
          isShowSavedAddress={true}
        />
        <ProductsPay
          products_api={products}
          loading={loading}
          handleChangeMessage={handleChangeMessage}
          serviceFee={serviceFee}
          feeService={feeService}
          setFeeServince={setFeeServince}
          leadTime={leadTime}
          servicePackage={servicePackage}
          setServiceTypeId={setServiceTypeId}
        />
        <Payment
          sumProduct={sumProduct}
          loading={loading}
          handleMethodPayProduct={handleMethodPayProduct}
          handleChangeMethodPayProduct={handleChangeMethodPayProduct}
          handleShowPayTable={handleShowPayTable}
          payMethodActive={payMethodActive}
          setPayMethodActive={setPayMethodActive}
          leadTime={leadTime}
        />
        <PayMethod
          isShowTablePay={isShowTablePay}
          handleIntegrate={handleIntegrate}
          showPayPal={showPayPal}
        />
      </PayComponent>
    </Helmet>
  );
}

Pay.propTypes = {};

export default Pay;
