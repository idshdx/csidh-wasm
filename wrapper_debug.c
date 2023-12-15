#include <emscripten.h>
#include "csidh.h"
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

// extra
#include "uint.h"
#include "fp.h"
#include "mont.h"
#include "rng.h"

void priv_print(private_key const *k)
{
    char cc = '0';
    for (size_t i = 0; i < sizeof(k->e)/sizeof(*k->e); ++i) {
        char nc = k->e[i] > 0 ? '6' : k->e[i] < 0 ? '4' : '7';
        if (nc != cc) cc = nc, printf("\x1b[3%cm", cc);
        printf(MAX_EXPONENT < 16 ? "%x" : "%02x", abs(k->e[i]));
    }
    printf("\x1b[0m");
    printf("\n");
}
void uint_print(uint const *x)
{
    for (size_t i = 8*LIMBS-1; i < 8*LIMBS; --i)
        printf("%02hhx", i[(unsigned char *) x->c]);
    printf("\n");
}

void pkprint(public_key *pk) {
    printf("Public key A: ");
    for (int i = 0; i < LIMBS; i++) {
        printf("%llu ", pk->A.c[i]);
    }
    printf("\n");
}

void skprint(private_key *sk) {
    printf("Private key e: ");
    for (int i = 0; i < NUM_PRIMES; i++) {
        printf("%d ", sk->e[i]);
    }
    printf("\n");
}

bool validate_basic_pk(public_key const *in)
{
    uint dummy;
    if (!uint_sub3(&dummy, &in->A, &p)) {
        /* returns borrow */
        printf("returns borrow \n");
        printf("make sure A < p  \n");
        return false;
    }

    uint pm2;
    uint_set(&pm2, 2);
    if (uint_eq(&in->A, &pm2)) {
        printf(" make sure the curve is nonsingular: A != 2");
        return false;
    }

    uint_sub3(&pm2, &uint_0, &pm2);
    if (uint_eq(&in->A, &pm2)) {
        printf(" make sure the curve is nonsingular: A != -2");
        return false;
    }

    return true;
}

EMSCRIPTEN_KEEPALIVE
private_key* create_sk(void) {
    private_key* sk = (private_key*)malloc(sizeof(private_key));

    csidh_private(sk);

    printf("create_sk(): output sk: \n");
    priv_print(sk);

    return sk;
}

EMSCRIPTEN_KEEPALIVE
public_key* create_pk(private_key *sk) {
    printf("create_pk(): input sk: \n");
    priv_print(sk);

    public_key* pk = (public_key*)malloc(sizeof(public_key));
    const bool valid_pk = csidh(pk, &base, sk);

    printf("valid pk: %d \n", valid_pk);
    printf("create_pk(): output pk: \n");
    uint_print(&pk->A);

    return pk;
}

EMSCRIPTEN_KEEPALIVE
public_key* create_ss(public_key *pk, private_key *sk) {
    printf("create_ss(): input sk: \n");
    priv_print(sk);
    printf("create_ss(): input pk: \n");
    uint_print(&pk->A);

    const bool valid_pk = validate_basic_pk(pk);
    printf("valid pk: %d \n", valid_pk);

    public_key* ss = (public_key*)malloc(sizeof(public_key));

    const bool valid_ss = csidh(ss, pk, sk);
    printf("valid ss: %d \n", valid_ss);
    printf("create_ss(): output ss: \n");
    uint_print(&pk->A);

    return ss;
}

//    printf("Size of secret_key: %lu bytes\n", sizeof(sk));
//    printf("Size of public_key: %lu bytes\n", sizeof(pk));

//    memset(ss, 0, sizeof(public_key));

//#define IS_BIG_ENDIAN (*(uint16_t *)"\0\xff" < 0x100);
//if (IS_BIG_ENDIAN) {
//printf("Big-endian\n");
//} {
//printf("Little-endian\n");
//}
