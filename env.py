import os

# Load database URL from environment variables

DATABASE_URL = os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_cLm5KvfBDeV0@ep-twilight-forest-a2vgit80.eu-central-1.aws.neon.tech/ladle_shun_panty_468426"
)

SECRET_KEY = os.environ.setdefault(
    "SECRET_KEY",
    "dUyQ@mXR_PZLi&o>27!Ck46TKN^y*f6w_dohsnXZCeoN,XauUJD?ff_H@RA_HLgq8gA7y0FNK,W:BhB:V}MFv1Q!"
)

CLOUDINARY_URL = os.environ.setdefault(
    "CLOUDINARY_URL",
    "cloudinary://265269448251462:nnYSveHr425Fd7VILmOpHjzxZ3I"
)