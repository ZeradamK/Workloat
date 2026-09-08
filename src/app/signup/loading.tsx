/**
 * Route-level loader: the same flower mark, shown while /signup streams in
 * so entering the auth screen always leads with the loading icon.
 */
export default function SignupLoading() {
  const dots = ["#0a0a0a", "#0a0a0a", "#cfcdc8", "#cfcdc8", "#cfcdc8", "#0a0a0a"];
  return (
    <main className="grid min-h-screen bg-white min-[900px]:grid-cols-2">
      <div className="flex justify-center pt-[60px]">
        <div className="relative h-8 w-8 animate-spin [animation-duration:0.9s]">
          {dots.map((c, i) => {
            const a = (i * Math.PI) / 3;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-[7px] w-[7px] rounded-full"
                style={{
                  backgroundColor: c,
                  transform: `translate(calc(-50% + ${Math.sin(a) * 11}px), calc(-50% + ${-Math.cos(a) * 11}px))`,
                }}
              />
            );
          })}
          <span className="absolute left-1/2 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0a]" />
        </div>
      </div>
      <div className="hidden p-[20px] min-[900px]:block">
        <div className="h-full w-full rounded-[20px] bg-[#0a1a8a]" />
      </div>
    </main>
  );
}
