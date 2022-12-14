import React from 'react';
import { Link } from 'react-router-dom';
import Grid from '../Grid';

const footerAboutLink = [
    { display: 'Introduce', path: '/about' },
    { display: 'Contact', path: '/contact' },
    { display: 'Recruitment', path: '/recruitment' },
    { display: 'News', path: '/news' },
    { display: 'Shop System', path: '/system' },
];

const footerCustomLink = [
    { display: 'Return Policy', path: '/return-policy' },
    { display: 'Warranty Policy', path: '/warranty-policy' },
    { display: 'Refund Policy', path: '/refund-policy' },
];
export default function Footer() {
    return (
        <footer className="footer">
            <div className="container container-footer">
                <Grid
                    col={4}
                    mdCol={2}
                    smCol={1}
                    gap={10}
                    bgr={false}
                    className="footer-item"
                >
                    <div className="footer-item">
                        <div className="footer__title">Support call center</div>
                        <div className="footer__content">
                            <p>
                                Order contact<strong>0397348149</strong>
                            </p>
                            <p>
                                Order inquiries<strong>0397348149</strong>
                            </p>
                            <p>
                                Suggestions, complaints
                                <strong>0397348149</strong>
                            </p>
                        </div>
                    </div>
                    <div className="footer-item">
                        <div className="footer__title">About Iphone</div>
                        <div className="footer__content">
                            {footerAboutLink.map((item, index) => (
                                <p key={index}>
                                    <Link to={item.path}>{item.display}</Link>
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="footer-item">
                        <div className="footer__title">Customer care</div>
                        <div className="footer__content">
                            {footerCustomLink.map((item, index) => (
                                <p key={index}>
                                    <Link to={item.path}>{item.display}</Link>
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="footer__about footer-item">
                        <p>
                            <Link to="/">
                                <img
                                    alt=""
                                    src="https://www.gameartguppy.com/wp-content/uploads/2017/06/logo-apple.png"
                                    className="footer__logo"
                                />
                            </Link>
                        </p>
                        <p>
                            H?????ng ?????n m???c ti??u l?? t???o n??n 1 th??? tr?????ng ??i???n t???
                            l???n nh???t Vi???t Nam, shop Iphone cung c???p nh???ng chi???c
                            Iphone ?????i m???i nh???t, v???i nh???ng ti???n ??ch m?? hi???m c??
                            h??ng ??i???n tho???i n??o s??nh ???????c. H??y c??ng Iphone h?????ng
                            ?????n 1 cu???c s???ng ?????y ????? ti???n nghi h??n.
                        </p>
                    </div>
                </Grid>
            </div>
        </footer>
    );
}
