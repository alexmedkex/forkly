#!/bin/bash -e

# helper functions
function header() {
    echo
    echo "======================================================================"
    echo "  $1"
    echo "======================================================================"
}

# common constants and prepare
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
TMP_DIR="$BASE_DIR/tmp"
mkdir -p $TMP_DIR

# ==========================================================
# 1) install the correct Erlang version if necessary
# ==========================================================

header "Erlang instalation"

# constants
KERL="$TMP_DIR/kerl"
KERL_BASE_DIR="$TMP_DIR/.kerl"

export KERL_BASE_DIR

# 1.1) get kerl if necessary
if [ ! -f "$KERL" ]; then
    echo "Downloading kerl..."
    curl --fail https://raw.githubusercontent.com/kerl/kerl/1.8.5/kerl -o $KERL
    chmod +x $KERL
fi

# 1.2) build and install Erlang OTP 20.0 if necessary
if [ ! -d "$KERL_BASE_DIR/builds/otp-20.0/release_20.0" ]; then
    echo "Building erlang"
    $KERL build 20.0 otp-20.0
fi

if [ ! -d "$TMP_DIR/erlang/20.0" ]; then
    echo "Installing erlang"
    $KERL install otp-20.0 $TMP_DIR/erlang/20.0
fi

# 1.3) use Erlang 20.0 onwards
source $TMP_DIR/erlang/20.0/activate

echo "Erlang OTP 20.0 is installed"

# ==========================================================
# 2) install the correct Elixir version if necessary
# ==========================================================

header "Elixir installation"

# constants
EXENV="$TMP_DIR/exenv/bin/exenv"
EXENV_ROOT="$TMP_DIR/exenv"

export EXENV_ROOT

# 2.1) get exenv with elixir-build plugin if necessary
if [ ! -d "$TMP_DIR/exenv" ]; then
    echo "Cloning exenv & elixir-build plugin"
    git clone git://github.com/mururu/exenv.git $TMP_DIR/exenv
    git -C $TMP_DIR/exenv checkout 725422836b4f1aa1eb0173a5453f5a95f5cf65b8
    git clone git://github.com/mururu/elixir-build.git $TMP_DIR/exenv/plugins/elixir-build
    git -C $TMP_DIR/exenv/plugins/elixir-build checkout 447718dab0e40b66685be84e279fc317b71e511e
fi

# 2.2) install exenv 1.6.0 if necessary
if [ ! -d "$EXENV_ROOT/versions/1.6.6" ]; then
    echo "Installing elixir 1.6.6"
    $EXENV install 1.6.6
    $EXENV rehash
fi

# 2.3) use elixir 1.6.6 onwards
$EXENV global 1.6.6
export PATH=$PATH:$EXENV_ROOT/shims:$EXENV_ROOT/bin

# 2.4) output elixir and Erlang versions
echo "Elixir 1.6.6 is installed"
elixir --version

# ==========================================================
# 3) build patched RabbitMQ Management Plugin
# ==========================================================

header "RabbitMQ Management Plugin - build patched binary"

if [ "$1" = "--delete-all" ]; then
    rm -rf $TMP_DIR/rabbitmq-management/deps
    rm -rf $TMP_DIR/rabbitmq-management/.erlang.mk
fi

# 3.1) get rabbitmq-management repository, checkout v3.7.8 and apply patch
if [ ! -d "$TMP_DIR/rabbitmq-management" ]; then
    git clone https://github.com/rabbitmq/rabbitmq-management.git $TMP_DIR/rabbitmq-management
    git -C $TMP_DIR/rabbitmq-management checkout v3.7.8
    git -C $TMP_DIR/rabbitmq-management am < $BASE_DIR/0001-KOMGO-2729.patch
fi


export EZ_DIR="$TMP_DIR/rabbitmq-management"
pushd $TMP_DIR/rabbitmq-management
make clean && make && make dist || {
        echo "Failed to build library, check for errors above"
        popd
        exit 1
    }

# ==========================================================
# 4) Print a neat summary
# ==========================================================

header "Summary"
# 4) kindly highlight the compiled binary to the user
echo "Patched plugin binary:"
binary_path=$(find $TMP_DIR/rabbitmq-management -name "rabbitmq_management-*.ez")
ls -la $binary_path

echo
echo "Replace current binary running the command bellow and update docker-compose volumes:"
echo "\$ cp $binary_path plugins/"
