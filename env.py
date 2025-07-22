import os

# Load database URL from environment variables

DATABASE_URL = os.environ.setdefault(
    "DATABASE_URL",
	"postgresql://neondb_owner:npg_cLm5KvfBDeV0@ep-twilight-forest-a2vgit80.eu-central-1.aws.neon.tech/ladle_shun_panty_468426"
)

SECRET_KEY = os.environ.setdefault(
	"SECRET_KEY",
	"ybZj_I|o!bvN-}LEb9c~^XU[w4!@PIBDToLD6%vBfgR*7GPC[B)BTUkH(nUWhFA-)q.;bJzs-[PV]&dP#86SYT"
)