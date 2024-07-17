const textVersionForEmail =
  "Kính gửi Quý {{GENDER}} {{COMPANY_NAME}}, Khi nghĩ về những đứa trẻ đói khát, tôi luôn tự hỏi mình đã đóng góp được gì. Chính câu hỏi đó đã dẫn đến việc thành lập Quỹ Từ Thiện Trái Tim Việt, một tổ chức từ thiện phi lợi nhuận với sứ mệnh giúp đỡ trẻ em nghèo khó tại các vùng sâu vùng xa của Việt Nam. Trong suốt 1 năm qua, chúng tôi đã nỗ lực không ngừng để mang lại bữa ăn ấm no cho những trẻ em tại các bản làng xa xôi. Không chỉ cung cấp thực phẩm, chúng tôi còn xây dựng những ngôi nhà nhỏ chắc chắn, cung cấp thuốc men, trang thiết bị y tế và tài liệu giáo dục cho các em. Tuy nhiên, để mở rộng và duy trì quỹ, chúng tôi cần sự hỗ trợ của tất cả mọi người. Từ khi thành lập, tổ chức đã nhận được sự ủng hộ rất lớn. Hơn 80% số tiền quyên góp được sử dụng trực tiếp cho các chương trình hỗ trợ người nghèo. Tôi xin mời Quý vị cùng chia sẻ niềm vui trong việc mang lại sự giúp đỡ, an ủi và hy vọng cho những người khác. Quý vị có thể cứu giúp những đứa trẻ tại Việt Nam, những em bé chỉ có một bữa ăn mỗi ngày, hoặc mang lại hy vọng cho các tổ chức phi chính phủ đang nỗ lực nuôi dưỡng, giáo dục và chăm sóc những người anh chị em nghèo khổ của chúng ta. Chỉ với 20,000 đồng, Quý vị có thể cung cấp những nhu cầu cơ bản cho một em nhỏ trong một ngày. Món quà của Quý vị sẽ mua được thức ăn, quần áo và chỗ ở cho cả một tháng! 20,000 đồng sẽ mang lại hy vọng! Và hãy tưởng tượng món quà trị giá 50,000 đồng hoặc 100,000 đồng sẽ có ý nghĩa như thế nào đối với hàng nghìn trẻ em và các bà mẹ của các em. Mọi đóng góp xin gửi về tài khoản duy nhất: Số tài khoản: 81081041206900012 Chủ tài khoản: NGUYEN VAN TOAN Ngân hàng: Ocean Bank Người phục vụ cho người nghèo, Nguyễn Văn Toàn Quỹ Từ Thiện Trái Tim Việt";

const emailListForCreating = [
  // {
  //   email: "huynhhlinh99@gmail.com",
  //   companyName: "Huynh Linh",
  //   gender: "Bà",
  // },
  // {
  //   email: "leopham2008@gmail.com",
  //   companyName: "Linh HUynh",
  //   gender: "Ông",
  // },
  {
    email: "legiangbmt010@gmail.com",
    companyName: "Giang Le Thanh",
    gender: "Bà",
  },
  {
    email: "sabrinavicky124u1152@gmail.com",
    companyName: "Vicky",
    gender: "Bà",
  },
  // {
  //   email: "n17dcqt014@student.ptithcm.edu.vn",
  //   companyName: "Haha",
  //   gender: "Ông",
  // },
  // {
  //   email: "d19cqqt01a@gmail.com",
  //   companyName: "Haha Giang Tuan",
  //   gender: "Ông",
  // },
  // {
  //   email: "d19cqqt01@gmail.com",
  //   companyName: "Giang Tuan",
  //   gender: "Bà",
  // },
  {
    email: "1111d19cqqt01@gmail.com",
    companyName: "Giang Tuaan",
    gender: "Bà",
  },
  {
    email: "hkimtuyen@gmail.com",
    companyName: "Giang Tuaaaan",
    gender: "Bà",
  },
  {
    email: "congdanh6192@gmail.com",
    companyName: "Giang Tuuuan",
    gender: "Bà",
  },
  {
    email: "tuannguyentan17@gmail.com",
    companyName: "Giang Tuuuan",
    gender: "Bà",
  },
  {
    email: "dangthiminhyen81@gmail.com",
    companyName: "Giang Tuuuan",
    gender: "Bà",
  },
  {
    email: "kimchithanhphu@gmail.com",
    companyName: "Giang Tuuuan",
    gender: "Bà",
  },
  // {
  //   email: "test-019nl7vn6@srv1.mail-tester.com",
  //   companyName: "Giang Le Thanh",
  //   gender: "Bà",
  // },
  // {
  //   email: "senvest432@gmail.com",
  //   companyName: "Tuan Vu",
  //   gender: "Bà",
  // },
  // {
  //   email: "trinhailinh2023@gmail.com",
  //   companyName: "Hoang Nam",
  //   gender: "Bà",
  // },
  // {
  //   email: "ltt2012bmt@gmail.com",
  //   companyName: "o0oKayo0o",
  //   gender: "Ông",
  // },
  // {
  //   email: "caytienbmt01@gmail.com",
  //   companyName: "Lương Quế Phàn",
  //   gender: "Bà",
  // },
  // {
  //   email: "caytienbmt09@gmail.com",
  //   companyName: "Hà Mẫn Nhi",
  //   gender: "Bà",
  // },
  // {
  //   email: "caytienbmt02@gmail.com",
  //   companyName: "Tạ Quảng Tây",
  //   gender: "Ông",
  // },
  // {
  //   email: "doclapsg2024@gmail.com",
  //   companyName: "lập độc",
  //   gender: "Ông",
  // },
  // {
  //   email: "sgtudo2024@gmail.com",
  //   companyName: "Tự do",
  //   gender: "Ông",
  // },
  // {
  //   email: "hanhphucsg2024@gmail.com",
  //   companyName: "Hạnh Phúc",
  //   gender: "Bà",
  // },
  // {
  //   email: "thienlongbatbosg2024@gmail.com",
  //   companyName: "tĩnh quách",
  //   gender: "Ông",
  // },
  // {
  //   email: "hoangdungsg2024@gmail.com",
  //   companyName: "Dung Hoàng",
  //   gender: "Bà",
  // },
  // {
  //   email: "lttskda@gmail.com",
  //   companyName: "Nguyệt Cầm",
  //   gender: "Bà",
  // },
  // {
  //   email: "caytienbmt06@gmail.com",
  //   companyName: "Thiên Cơ",
  //   gender: "Bà",
  // },
];

module.exports = { textVersionForEmail, emailListForCreating };
