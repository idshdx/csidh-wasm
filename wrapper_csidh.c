#include <emscripten.h>
#include <stdlib.h>
#include "csidh.h"
#include "uint.h"

#define ERROR_INVALID_PK -1
#define ERROR_INVALID_SS -2
#define ERROR_NULL_POINTER -3
#define ERROR_SK_MEMORY -4
#define ERROR_PK_MEMORY -5
#define ERROR_SS_MEMORY -6

EMSCRIPTEN_KEEPALIVE
int error_code = 0;


private_key* allocate_pk(void) {
    private_key* k = (private_key*)malloc(sizeof(private_key));
    if (!k) {
        error_code = ERROR_SK_MEMORY;
        return NULL;
    }
    return k;
}

EMSCRIPTEN_KEEPALIVE
private_key* create_sk(void) {
    private_key* sk = (private_key*)malloc(sizeof(private_key));
    if (!sk) {
        error_code = ERROR_SK_MEMORY;
        return NULL;
    }
    csidh_private(sk);
    return sk;
}

EMSCRIPTEN_KEEPALIVE
public_key* create_pk(private_key *sk) {
    if (!sk) {
        error_code = ERROR_PK_MEMORY;
        return NULL;
    }
    public_key* pk = (public_key*)malloc(sizeof(public_key));
    if (!pk) {
        error_code = ERROR_SK_MEMORY;
        return NULL;
    }
    csidh(pk, &base, sk);
    return pk;
}

EMSCRIPTEN_KEEPALIVE
public_key* create_ss(public_key *pk, private_key *sk) {
    if (!pk || !sk) {
        error_code = ERROR_PK_MEMORY;
        return NULL;
    }
    public_key* ss = (public_key*)malloc(sizeof(public_key));
    if (!ss) {
        error_code = ERROR_SS_MEMORY;
        return NULL;
    }
    csidh(ss, pk, sk);
    return ss;
}

EMSCRIPTEN_KEEPALIVE
public_key* create_pk_validated(private_key *sk) {
    if (!sk) {
        error_code = ERROR_PK_MEMORY;
        return NULL;
    }
    public_key* pk = (public_key*)malloc(sizeof(public_key));
    if (!pk) {
        error_code = ERROR_SK_MEMORY;
        return NULL;
    }
    const bool is_valid = csidh(pk, &base, sk);
    if (is_valid != 1) {
        error_code = ERROR_INVALID_PK;
        free(pk);
        return NULL;
    }

    return pk;
}

EMSCRIPTEN_KEEPALIVE
public_key* create_ss_validated(public_key *pk, private_key *sk) {
    if (!pk || !sk) {
        error_code = ERROR_PK_MEMORY;
        return NULL;
    }
    public_key* ss = (public_key*)malloc(sizeof(public_key));
    if (!ss) {
        error_code = ERROR_SS_MEMORY;
        return NULL;
    }
    const bool is_valid = csidh(ss, pk, sk);
    if (is_valid != 1) {
        error_code = ERROR_INVALID_SS;
        free(ss);
        return NULL;
    }

    return ss;
}

EMSCRIPTEN_KEEPALIVE
bool check_pk(public_key const *pk)
{
    /* make sure A < p */
    uint dummy;
    if (!uint_sub3(&dummy, &pk->A, &p)) /* returns borrow */
        return false;

    /* make sure the curve is non-singular: A != 2 */
    uint pm2;
    uint_set(&pm2, 2);
    if (uint_eq(&pk->A, &pm2))
        return false;

    /* make sure the curve is non-singular: A != -2 */
    uint_sub3(&pm2, &uint_0, &pm2);
    if (uint_eq(&pk->A, &pm2))
        return false;

    return true;
}
