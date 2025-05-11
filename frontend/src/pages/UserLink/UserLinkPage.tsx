import React, {JSX} from 'react';
import { useParams, Link } from 'react-router-dom';
import './UserLinkPage.css';

const UserLinkPage: React.FC = () => {
    const { type } = useParams<{ type: string }>();

    const contentMap: { [key: string]: { title: string; content: JSX.Element } } = {
        about: {
            title: 'Về chúng tôi',
            content: (
                <>
                    <p>
                        Chúng tôi là một nền tảng đặt đồ ăn trực tuyến, mang đến cho bạn những bữa ăn ngon miệng và tiện lợi ngay tại nhà. Với sứ mệnh phục vụ khách hàng tốt nhất, chúng tôi hợp tác với nhiều nhà hàng uy tín để đảm bảo chất lượng món ăn và dịch vụ giao hàng nhanh chóng.
                    </p>
                    <p>
                        Đội ngũ của chúng tôi luôn không ngừng cải thiện để mang lại trải nghiệm tuyệt vời nhất cho bạn. Hãy cùng chúng tôi thưởng thức những món ăn yêu thích và khám phá thêm nhiều hương vị mới!
                    </p>
                </>
            ),
        },
        delivery: {
            title: 'Giao hàng',
            content: (
                <>
                    <p>
                        Chúng tôi cung cấp dịch vụ giao hàng nhanh chóng và đáng tin cậy. Thời gian giao hàng trung bình của chúng tôi là từ 30-45 phút, tùy thuộc vào vị trí của bạn và nhà hàng.
                    </p>
                    <ul>
                        <li>Phí giao hàng: $2 cho đơn hàng dưới 5km, $3 cho đơn hàng từ 5-10km.</li>
                        <li>Miễn phí giao hàng cho đơn hàng từ $200 trở lên.</li>
                        <li>Giao hàng trong giờ làm việc: 09:00 - 22:00 mỗi ngày.</li>
                    </ul>
                    <p>
                        Nếu có bất kỳ vấn đề nào về giao hàng, vui lòng liên hệ hotline: <strong>+84 973 870 244</strong>.
                    </p>
                </>
            ),
        },
        payment: {
            title: 'Thanh toán',
            content: (
                <>
                    <p>
                        Chúng tôi hỗ trợ nhiều phương thức thanh toán để bạn có thể dễ dàng lựa chọn:
                    </p>
                    <ul>
                        <li>Thanh toán tiền mặt khi nhận hàng (COD).</li>
                        <li>Thanh toán qua ví điện tử: Momo, ZaloPay, ViettelPay.</li>
                        <li>Thanh toán qua thẻ ngân hàng: Visa, MasterCard, JCB.</li>
                        <li>Chuyển khoản ngân hàng (đối với đơn hàng lớn).</li>
                    </ul>
                    <p>
                        Tất cả giao dịch của bạn đều được bảo mật an toàn. Nếu có vấn đề về thanh toán, hãy liên hệ với chúng tôi qua email hoặc hotline để được hỗ trợ.
                    </p>
                </>
            ),
        },
        policy: {
            title: 'Chính sách',
            content: (
                <>
                    <p>
                        Chúng tôi cam kết cung cấp dịch vụ tốt nhất cho khách hàng với các chính sách rõ ràng:
                    </p>
                    <ul>
                        <li><strong>Chính sách đổi trả:</strong> Hoàn tiền 100% nếu món ăn không đúng mô tả hoặc có vấn đề về chất lượng (yêu cầu liên hệ trong vòng 24 giờ).</li>
                        <li><strong>Chính sách bảo mật:</strong> Thông tin cá nhân của bạn được bảo mật tuyệt đối và không chia sẻ cho bên thứ ba.</li>
                        <li><strong>Chính sách hủy đơn:</strong> Bạn có thể hủy đơn hàng trước khi nhà hàng xác nhận (trong vòng 5 phút sau khi đặt).</li>
                    </ul>
                    <p>
                        Để biết thêm chi tiết, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
                    </p>
                </>
            ),
        },
    };

    if (!type || !contentMap[type]) {
        return (
            <div className="user-link-page">
                <h2>Không tìm thấy nội dung</h2>
                <p>Xin lỗi, chúng tôi không thể tìm thấy nội dung bạn yêu cầu.</p>
                <Link to="/home" className="back-link">Quay lại trang chủ</Link>
            </div>
        );
    }

    const { title, content } = contentMap[type];

    return (
        <div className="user-link-page">
            <h2>{title}</h2>
            <div className="content">
                {content}
            </div>
            <Link to="/home" className="back-link">Quay lại trang chủ</Link>
        </div>
    );
};

export default UserLinkPage;