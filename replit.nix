{pkgs}: {
  deps = [
    pkgs.suitesparse
    pkgs.openblas
    pkgs.gsl
    pkgs.glpk
    pkgs.fftw
    pkgs.opencl-headers
    pkgs.ocl-icd
    pkgs.glibcLocales
    pkgs.postgresql
    pkgs.zip
  ];
}
