const styles = {
  boxWidth: "w-full",
  boxWidthDashboard: "xl:max-w-[100svw] w-full h-full",

  heading2: "font-poppins font-semibold xs:text-[36px] text-[32px] text-white xs:leading-[66.8px] leading-[46.8px] w-full",
  heading4: "font-poppins font-semibold xs:text-[24px] text-[32px] text-white xs:leading-[52px] leading-[42px] w-full",
  paragraph: "font-poppins font-normal text-dimWhite text-[18px] leading-[46.8px w-full",

  flexCenterNav: "flex justify-center items-center gap-2",
  flexCenter: "flex justify-center items-center gap-2 mt-5",
  flexStart: "flex flex-col w-full justify-center items-start",
  flexBetween: "flex justify-between",
  flexColumn: "flex flex-col",

  paddingX: "sm:px-20 px-6",
  paddingY: "sm:py-16 py-6",
  padding: "sm:px-16 px-6 sm:py-12 py-4",

  marginX: "sm:mx-16 mx-6",
  marginY: "sm:my-16 my-6",
};

export const layout = {
  section: `flex md:flex-row flex-col ${styles.paddingY}`,
  sectionReverse: `flex md:flex-row flex-col-reverse ${styles.paddingY}`,

  sectionImgReverse: `flex-1 flex ${styles.flexCenter} md:mr-10 mr-0 md:mt-0 mt-10 relative`,
  sectionImg: `flex-1 flex ${styles.flexCenter} md:ml-10 ml-0 md:mt-0 mt-10 relative`,

  sectionInfo: `flex-1 ${styles.flexStart} flex-col`,
};

export default styles;
