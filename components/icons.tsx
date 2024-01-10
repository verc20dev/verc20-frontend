import * as React from "react";
import { IconSvgProps } from "@/types";


export const Logo: React.FC<IconSvgProps> = ({
  size = 36,
  width,
  height,
  ...props
}) => (
  <svg
    fill="none"
    height={size || height}
    viewBox="0 0 32 32"
    width={size || width}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const DropDownIcon: React.FC<IconSvgProps> = ({
  size,
  width = 14,
  height = 7,
  ...props
}) => {
  return (
    <svg
      fill="none"
      height={size || height}
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Dropdown</title>
      <path d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001"
            stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
            xmlns="http://www.w3.org/2000/svg"></path>
    </svg>
  );
}

export const WalletIcon: React.FC<IconSvgProps> = ({
  size,
  width = 20,
  height = 20,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 12C19 12.5523 18.5523 13 18 13C17.4477 13 17 12.5523 17 12C17 11.4477 17.4477 11 18 11C18.5523 11 19 11.4477 19 12Z"
        fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd"
            d="M9.94358 3.25H13.0564C14.8942 3.24998 16.3498 3.24997 17.489 3.40314C18.6614 3.56076 19.6104 3.89288 20.3588 4.64124C21.2831 5.56563 21.5777 6.80363 21.6847 8.41008C22.2619 8.6641 22.6978 9.2013 22.7458 9.88179C22.7501 9.94199 22.75 10.0069 22.75 10.067C22.75 10.0725 22.75 10.0779 22.75 10.0833V13.9167C22.75 13.9221 22.75 13.9275 22.75 13.933C22.75 13.9931 22.7501 14.058 22.7458 14.1182C22.6978 14.7987 22.2619 15.3359 21.6847 15.5899C21.5777 17.1964 21.2831 18.4344 20.3588 19.3588C19.6104 20.1071 18.6614 20.4392 17.489 20.5969C16.3498 20.75 14.8942 20.75 13.0564 20.75H9.94359C8.10583 20.75 6.65019 20.75 5.51098 20.5969C4.33856 20.4392 3.38961 20.1071 2.64124 19.3588C1.89288 18.6104 1.56076 17.6614 1.40314 16.489C1.24997 15.3498 1.24998 13.8942 1.25 12.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33856 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40314C6.65019 3.24997 8.10582 3.24998 9.94358 3.25ZM20.1679 15.75H18.2308C16.0856 15.75 14.25 14.1224 14.25 12C14.25 9.87756 16.0856 8.25 18.2308 8.25H20.1679C20.0541 6.90855 19.7966 6.20043 19.2981 5.7019C18.8749 5.27869 18.2952 5.02502 17.2892 4.88976C16.2615 4.75159 14.9068 4.75 13 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.75159 8.73851 2.75 10.0932 2.75 12C2.75 13.9068 2.75159 15.2615 2.88976 16.2892C3.02502 17.2952 3.27869 17.8749 3.7019 18.2981C4.12511 18.7213 4.70476 18.975 5.71085 19.1102C6.73851 19.2484 8.09318 19.25 10 19.25H13C14.9068 19.25 16.2615 19.2484 17.2892 19.1102C18.2952 18.975 18.8749 18.7213 19.2981 18.2981C19.7966 17.7996 20.0541 17.0915 20.1679 15.75ZM5.25 8C5.25 7.58579 5.58579 7.25 6 7.25H10C10.4142 7.25 10.75 7.58579 10.75 8C10.75 8.41421 10.4142 8.75 10 8.75H6C5.58579 8.75 5.25 8.41421 5.25 8ZM20.9235 9.75023C20.9032 9.75001 20.8766 9.75 20.8333 9.75H18.2308C16.8074 9.75 15.75 10.8087 15.75 12C15.75 13.1913 16.8074 14.25 18.2308 14.25H20.8333C20.8766 14.25 20.9032 14.25 20.9235 14.2498C20.936 14.2496 20.9426 14.2495 20.9457 14.2493L20.9479 14.2492C21.1541 14.2367 21.2427 14.0976 21.2495 14.0139C21.2495 14.0139 21.2497 14.0076 21.2498 13.9986C21.25 13.9808 21.25 13.9572 21.25 13.9167V10.0833C21.25 10.0428 21.25 10.0192 21.2498 10.0014C21.2497 9.99238 21.2495 9.98609 21.2495 9.98609C21.2427 9.90242 21.1541 9.7633 20.9479 9.75076C20.9479 9.75076 20.943 9.75043 20.9235 9.75023Z"
            fill="currentColor"/>
    </svg>
  )
}

export const CopyIcon: React.FC<IconSvgProps> = ({
  size,
  width = 20,
  height = 20,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <rect width="24" height="24"></rect>
        <rect x="4" y="8" width="12" height="12" rx="1" stroke="currentColor" strokeLinecap="round" strokeWidth="2"
              strokeLinejoin="round"></rect>
        <path d="M8 6V5C8 4.44772 8.44772 4 9 4H19C19.5523 4 20 4.44772 20 5V15C20 15.5523 19.5523 16 19 16H18"
              strokeWidth="2"
              stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3"></path>
      </g>
    </svg>
  )
}

export const DisconnectIcon: React.FC<IconSvgProps> = ({
  size,
  width = 20,
  height = 20,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>entrance_line</title>
      <g id="page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="System" transform="translate(-672.000000, -96.000000)" fillRule="nonzero">
          <g id="entrance_line" transform="translate(672.000000, 96.000000)">
            <path
              d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z"
              id="MingCute" fillRule="nonzero">
            </path>
            <path
              d="M12,3 C12.5523,3 13,3.44772 13,4 C13,4.51283143 12.613973,4.93550653 12.1166239,4.9932722 L12,5 L7,5 C6.48716857,5 6.06449347,5.38604429 6.0067278,5.88337975 L6,6 L6,18 C6,18.51285 6.38604429,18.9355092 6.88337975,18.9932725 L7,19 L11.5,19 C12.0523,19 12.5,19.4477 12.5,20 C12.5,20.51285 12.113973,20.9355092 11.6166239,20.9932725 L11.5,21 L7,21 C5.40232321,21 4.09633941,19.7511226 4.00509271,18.1762773 L4,18 L4,6 C4,4.40232321 5.24892392,3.09633941 6.82372764,3.00509271 L7,3 L12,3 Z M17.707,8.46447 L20.5355,11.2929 C20.926,11.6834 20.926,12.3166 20.5355,12.7071 L17.707,15.5355 C17.3165,15.9261 16.6834,15.9261 16.2928,15.5355 C15.9023,15.145 15.9023,14.5118 16.2928,14.1213 L17.4142,13 L12,13 C11.4477,13 11,12.5523 11,12 C11,11.4477 11.4477,11 12,11 L17.4142,11 L16.2928,9.87868 C15.9023,9.48816 15.9023,8.85499 16.2928,8.46447 C16.6834,8.07394 17.3165,8.07394 17.707,8.46447 Z"
              id="shape" fill="currentColor">
            </path>
          </g>
        </g>
      </g>
    </svg>
  )
}

export const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
      fill="currentColor"
    />
  </svg>
);

export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g fill="currentColor">
      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z"/>
      <path
        d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z"/>
    </g>
  </svg>
);

export const OutSiteIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" shapeRendering="geometricPrecision"
       stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24"
       width="1em">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
    <path d="M15 3h6v6"></path>
    <path d="M10 14L21 3"></path>
  </svg>
);

export const DiscordIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const TwitterIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"
        fill="currentColor"
      />
    </svg>
  );
};

export const GithubIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const GitBookIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      fill="currentColor"
      width={size || width}
      height={size || height}
      viewBox="0 0 24 24"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.802 17.77a.703.703 0 1 1-.002 1.406.703.703 0 0 1 .002-1.406m11.024-4.347a.703.703 0 1 1 .001-1.406.703.703 0 0 1-.001 1.406m0-2.876a2.176 2.176 0 0 0-2.174 2.174c0 .233.039.465.115.691l-7.181 3.823a2.165 2.165 0 0 0-1.784-.937c-.829 0-1.584.475-1.95 1.216l-6.451-3.402c-.682-.358-1.192-1.48-1.138-2.502.028-.533.212-.947.493-1.107.178-.1.392-.092.62.027l.042.023c1.71.9 7.304 3.847 7.54 3.956.363.169.565.237 1.185-.057l11.564-6.014c.17-.064.368-.227.368-.474 0-.342-.354-.477-.355-.477-.658-.315-1.669-.788-2.655-1.25-2.108-.987-4.497-2.105-5.546-2.655-.906-.474-1.635-.074-1.765.006l-.252.125C7.78 6.048 1.46 9.178 1.1 9.397.457 9.789.058 10.57.006 11.539c-.08 1.537.703 3.14 1.824 3.727l6.822 3.518a2.175 2.175 0 0 0 2.15 1.862 2.177 2.177 0 0 0 2.173-2.14l7.514-4.073c.38.298.853.461 1.337.461A2.176 2.176 0 0 0 24 12.72a2.176 2.176 0 0 0-2.174-2.174"/>
    </svg>
  )
}

export const BackIcon: React.FC<IconSvgProps> = ({
  size = 14,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || width}
      height={size || height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-testid="token-details-return-button"
    >
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );
}

export const SwapArrowIcon: React.FC<IconSvgProps> = ({
  size = 20,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M6.707 5.707a1 1 0 0 0-1.414-1.414l-4 4a1 1 0 0 0 0 1.414l4 4a1 1 0 0 0 1.414-1.414L4.414 10H14a1 1 0 1 0 0-2H4.414l2.293-2.293ZM17.293 10.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L19.586 16H10a1 1 0 1 1 0-2h9.586l-2.293-2.293a1 1 0 0 1 0-1.414Z"
          fill="currentColor"></path>
      </g>
    </svg>
  );
}

export const HammerIcon: React.FC<IconSvgProps> = ({
  size = 20,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      fill="currentColor"
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M 39.4615 8.1276 C 33.7743 2.4840 22.1821 1.8521 15.5362 8.5416 C 14.4467 9.6093 14.6428 10.8295 15.3836 11.5704 C 15.9066 12.1151 16.7346 12.3548 17.5191 12.1151 C 22.1603 10.6552 26.4529 10.5245 29.8739 13.0521 L 28.0436 17.9330 C 27.3463 19.8288 27.7167 21.1579 28.9587 22.4217 L 33.9922 27.4770 C 34.9945 28.5011 36.1059 28.8062 37.5658 28.4575 L 41.0959 27.6513 L 42.7953 29.3510 L 42.5119 31.8350 C 42.3597 32.8591 42.4905 33.4910 43.3839 34.3844 L 45.0832 36.0187 C 46.0204 36.9556 47.2186 37.0428 48.1120 36.1494 L 55.1066 29.1984 C 56 28.3050 55.8692 27.1066 54.9540 26.1478 L 53.2765 24.4700 C 52.4264 23.5984 51.7512 23.4241 50.7703 23.5766 L 48.2646 23.8817 L 46.5434 22.2257 L 47.5889 18.4778 C 47.9161 17.2576 47.5019 16.1245 46.1944 14.8389 Z M 2.2225 44.8000 C .1089 46.6739 0 48.6350 1.9611 50.6179 L 5.4257 54.0607 C 7.3650 56 9.3914 55.8910 11.2436 53.7992 L 32.2273 30.2443 L 25.7774 23.8163 Z"></path>
      </g>
    </svg>
  )
}

export const DeployIcon: React.FC<IconSvgProps> = ({
  size = 25,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <rect x="0" fill="none"></rect>
        <g>
          <path d="M21 14v5c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2V5c0-1.105.895-2 2-2h5v2H5v14h14v-5h2z"></path>
          <path d="M21 7h-4V3h-2v4h-4v2h4v4h2V9h4"></path>
        </g>
      </g>
    </svg>
  )
}

export const FilterIcon: React.FC<IconSvgProps> = ({
  size = 25,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      width={size || width}
      viewBox="0 0 32 32" focusable="false" className="chakra-icon css-1sdtgly" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd"
            d="M18 28H14C12.8954 28 12 27.1046 12 26V18.41L4.59 11C4.21441 10.6266 4.00223 10.1196 4 9.59V6C4 4.89543 4.89543 4 6 4H26C27.1046 4 28 4.89543 28 6V9.59C27.9978 10.1196 27.7856 10.6266 27.41 11L20 18.41V26C20 27.1046 19.1046 28 18 28ZM6 6V9.59L14 17.59V26H18V17.59L26 9.59V6H6Z"
            fill="currentColor"></path>
    </svg>
  )
}

export const CorrectIcon: React.FC<IconSvgProps> = ({
  size = 25,
  width,
  height,
  ...props
}) => {
  return <svg
    width={size || width}
    height={size || height}
    viewBox="0 0 1024 1024"
    className="icon"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    fill="#000000"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M511.64164 924.327835c-228.816869 0-414.989937-186.16283-414.989937-414.989937S282.825796 94.347961 511.64164 94.347961c102.396724 0 200.763434 37.621642 276.975315 105.931176 9.47913 8.499272 10.266498 23.077351 1.755963 32.556481-8.488009 9.501656-23.054826 10.266498-32.556481 1.778489-67.723871-60.721519-155.148319-94.156494-246.174797-94.156494-203.396868 0-368.880285 165.482394-368.880285 368.880285S308.243749 878.218184 511.64164 878.218184c199.164126 0 361.089542-155.779033 368.60998-354.639065 0.49556-12.720751 11.032364-22.863359 23.910794-22.177356 12.720751 0.484298 22.649367 11.190043 22.15483 23.910794-8.465484 223.74966-190.609564 399.015278-414.675604 399.015278z"
        fill="#22C67F"></path>
      <path
        d="M960.926616 327.538868l-65.210232-65.209209-350.956149 350.956149-244.56832-244.566273-65.210233 65.209209 309.745789 309.743741 0.032764-0.031741 0.03174 0.031741z"
        fill="#74E8AE"></path>
    </g>
  </svg>
}

export const ErrorIcon: React.FC<IconSvgProps> = ({
  size = 25,
  width,
  height,
  ...props
}) => {
  return <svg
    width={size || width}
    height={size || height}
    viewBox="0 0 16 16"
    // fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.967 1.707,11.010 2.136,11.944 2.834 C 12.273 3.080,12.920 3.727,13.166 4.056 C 13.727 4.807,14.142 5.690,14.330 6.535 C 14.544 7.500,14.544 8.500,14.330 9.465 C 13.916 11.326,12.605 12.978,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.618 9.422,1.514 8.781,1.514 8.000 C 1.514 6.961,1.715 6.075,2.160 5.160 C 2.500 4.462,2.846 3.980,3.413 3.413 C 3.980 2.846,4.462 2.500,5.160 2.160 C 6.313 1.599,7.567 1.397,8.853 1.563 M7.706 4.290 C 7.482 4.363,7.355 4.491,7.293 4.705 C 7.257 4.827,7.253 5.106,7.259 6.816 C 7.267 8.786,7.267 8.787,7.325 8.896 C 7.398 9.033,7.538 9.157,7.671 9.204 C 7.803 9.250,8.197 9.250,8.329 9.204 C 8.462 9.157,8.602 9.033,8.675 8.896 C 8.733 8.787,8.733 8.786,8.741 6.816 C 8.749 4.664,8.749 4.662,8.596 4.481 C 8.472 4.333,8.339 4.284,8.040 4.276 C 7.893 4.272,7.743 4.278,7.706 4.290 M7.786 10.530 C 7.597 10.592,7.410 10.753,7.319 10.932 C 7.249 11.072,7.237 11.325,7.294 11.495 C 7.388 11.780,7.697 12.000,8.000 12.000 C 8.303 12.000,8.612 11.780,8.706 11.495 C 8.763 11.325,8.751 11.072,8.681 10.932 C 8.616 10.804,8.460 10.646,8.333 10.580 C 8.217 10.520,7.904 10.491,7.786 10.530 "
        stroke="none" fillRule="evenodd" fill="#f31260"></path>
    </g>
  </svg>
}

export const QuestionIcon: React.FC<IconSvgProps> = ({
  size = 25,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      viewBox="0 -0.5 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path fillRule="evenodd" clipRule="evenodd"
              d="M5.5 13V11C5.5 7.68629 8.18629 5 11.5 5H13.5C16.8137 5 19.5 7.68629 19.5 11V13C19.5 16.3137 16.8137 19 13.5 19H11.5C8.18629 19 5.5 16.3137 5.5 13Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path
          d="M10.5 9.63895C10.5 8.54895 11.4 7.94895 12.747 7.99995C13.7191 8.03367 14.492 8.82731 14.5 9.79995C14.547 10.7095 14.116 11.5776 13.363 12.09C12.723 12.5 12.3847 13.2487 12.5 14"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path
          d="M12.5 16.5C12.2243 16.5 12 16.2757 12 16C12 15.7243 12.2243 15.5 12.5 15.5C12.7757 15.5 13 15.7243 13 16C13 16.2757 12.7757 16.5 12.5 16.5Z"
          fill="currentColor"></path>
        <path
          d="M12.5 15C13.0523 15 13.5 15.4477 13.5 16C13.5 16.5523 13.0523 17 12.5 17C11.9477 17 11.5 16.5523 11.5 16C11.5 15.4477 11.9477 15 12.5 15Z"
          fill="currentColor"></path>
      </g>
    </svg>
  )
}

export const CoinIcon: React.FC<IconSvgProps> = ({
  size = 25,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path fillRule="evenodd" clipRule="evenodd"
              d="M8 1C11.866 1 15 2.56689 15 4.5V6C15 6.55228 14.5523 7 14 7H13C11.7295 7.64819 9.95868 8 8 8C6.04132 8 4.27051 7.64819 3 7V8.5C3 9.22569 4.71803 9.83109 7.00053 9.97002C7.55179 10.0036 8 10.4477 8 11C8 11.5523 7.55166 12.0038 7.0005 11.9686C5.44274 11.8692 4.05039 11.5359 3 11V12.5C3 13.2257 4.71803 13.8311 7.00053 13.97C7.55179 14.0036 8 14.4477 8 15C8 15.5523 7.55132 16.004 7.00044 15.9646C3.60793 15.7221 1 14.2634 1 12.5V4.5C1 2.56689 4.134 1 8 1ZM3 4.5C3 3.67163 5.23859 3 8 3C10.7614 3 13 3.67163 13 4.5C13 5.32837 10.7614 6 8 6C5.23859 6 3 5.32837 3 4.5Z"
              fill="currentColor"></path>
        <path fillRule="evenodd" clipRule="evenodd"
              d="M23 11.5C23 9.567 19.866 8 16 8C12.134 8 9 9.567 9 11.5V19.5C9 21.433 12.134 23 16 23C19.866 23 23 21.433 23 19.5V11.5ZM11 19.5C11 20.3284 13.2386 21 16 21C18.7614 21 21 20.3284 21 19.5V18C19.7295 18.6483 17.9587 19 16 19C14.0413 19 12.2705 18.6483 11 18V19.5ZM16 17C13.2386 17 11 16.3284 11 15.5V14C12.2705 14.6483 14.0413 15 16 15C17.9587 15 19.7295 14.6483 21 14V15.5C21 16.3284 18.7614 17 16 17ZM16 10C13.2386 10 11 10.6716 11 11.5C11 12.3284 13.2386 13 16 13C18.7614 13 21 12.3284 21 11.5C21 10.6716 18.7614 10 16 10Z"
              fill="currentColor"></path>
      </g>
    </svg>
  )
}

export const EthereumIcon: React.FC<IconSvgProps> = ({
  size = 18,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      width={size || width}
      height={size || height}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g fill="none" fillRule="evenodd">
          <circle cx="16" cy="16" r="16" fill="#627EEA"></circle>
          <g fill="#FFF" fillRule="nonzero">
            <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z"></path>
            <path d="M16.498 4L9 16.22l7.498-3.35z"></path>
            <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z"></path>
            <path d="M16.498 27.995v-6.028L9 17.616z"></path>
            <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"></path>
            <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z"></path>
          </g>
        </g>
      </g>
    </svg>
  )
}