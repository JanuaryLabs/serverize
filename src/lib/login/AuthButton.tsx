import { useMutation } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { signInWithGithub } from './auth';

export function AuthButton() {
  const githubAuthMutate = useMutation({
    mutationFn: async () => {
      const result = await signInWithGithub();
      console.log(result);
      if (result && result.accessToken) {
      }
    },
  });
  return (
    <Button
      disabled={githubAuthMutate.isPending}
      className="gap-x-2"
      onClick={() => {
        githubAuthMutate.mutate();
      }}
    >
      {githubAuthMutate.isPending && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <radialGradient
            id="a6"
            cx=".66"
            fx=".66"
            cy=".3125"
            fy=".3125"
            gradientTransform="scale(1.5)"
          >
            <stop offset="0" stop-color="#FF156D"></stop>
            <stop offset=".3" stop-color="#FF156D" stop-opacity=".9"></stop>
            <stop offset=".6" stop-color="#FF156D" stop-opacity=".6"></stop>
            <stop offset=".8" stop-color="#FF156D" stop-opacity=".3"></stop>
            <stop offset="1" stop-color="#FF156D" stop-opacity="0"></stop>
          </radialGradient>
          <circle
            transform-origin="center"
            fill="none"
            stroke="url(#a6)"
            stroke-width="15"
            stroke-linecap="round"
            stroke-dasharray="200 1000"
            stroke-dashoffset="0"
            cx="100"
            cy="100"
            r="70"
          >
            <animateTransform
              type="rotate"
              attributeName="transform"
              calcMode="spline"
              dur="2"
              values="360;0"
              keyTimes="0;1"
              keySplines="0 0 1 1"
              repeatCount="indefinite"
            ></animateTransform>
          </circle>
          <circle
            transform-origin="center"
            fill="none"
            opacity=".2"
            stroke="#FF156D"
            stroke-width="15"
            stroke-linecap="round"
            cx="100"
            cy="100"
            r="70"
          ></circle>
        </svg>
      )}
      <svg width="20" height="20" aria-label="github" viewBox="0 0 14 14">
        <path
          fill="currentColor"
          d="M7 .175c-3.872 0-7 3.128-7 7 0 3.084 2.013 5.71 4.79 6.65.35.066.482-.153.482-.328v-1.181c-1.947.415-2.363-.941-2.363-.941-.328-.81-.787-1.028-.787-1.028-.634-.438.044-.416.044-.416.7.044 1.071.722 1.071.722.635 1.072 1.641.766 2.035.59.066-.459.24-.765.437-.94-1.553-.175-3.193-.787-3.193-3.456 0-.766.262-1.378.721-1.881-.065-.175-.306-.897.066-1.86 0 0 .59-.197 1.925.722a6.8 6.8 0 0 1 1.75-.24c.59 0 1.203.087 1.75.24 1.335-.897 1.925-.722 1.925-.722.372.963.131 1.685.066 1.86.46.48.722 1.115.722 1.88 0 2.691-1.641 3.282-3.194 3.457.24.219.481.634.481 1.29v1.926c0 .197.131.415.481.328C11.988 12.884 14 10.259 14 7.175c0-3.872-3.128-7-7-7"
        ></path>
      </svg>
      Github
    </Button>
  );
}
