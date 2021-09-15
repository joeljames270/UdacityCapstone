import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";

import { verify, decode } from "jsonwebtoken";
import { createLogger } from "../../utils/logger";
// import Axios from "axios";
import { JwtPayload } from "../../auth/JwtPayload";
import { Jwt } from "../../auth/Jwt";
const logger = createLogger("auth");

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = "https://dev-ffr9sby7.us.auth0.com/.well-known/jwks.json";

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info("Authorizing a user", event.authorizationToken);
  
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info("User was authorized", jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("User not authorized", { error: e.message });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const token = getToken(authHeader);

  const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  const jwtKid = jwt.header.kid;

  const jwks= {"keys":[{"alg":"RS256","kty":"RSA","use":"sig","n":"n9XWSXN-5-4I-zzdoKbUT4BxM51TN8jPzBPMwi7kN40zxDjGFcyPTN0327DD1Y7WuScwln2jcrcQTYeF4uCbKKJRYXi2alZGxRinvfhktSb9g7m2qP09x1t9oSUepV4gvSatQMQTXZFS9ZmXW4CBTIVqPohgwgaWXnOtPo9zuC5q_rJFRwAGdEpvJqnLx1fKQklOP0UAKpKwAFsn5I_b7EyOlcNcPMEv6s4KxPohMGZCpf7XP8i9O0MdRuKIold_PDSt4vBttJF5uh5i4sL5FduxhpDIgEtDLdg6-GsiKH35SgFmyp1wg0UMtT8eD6F-nVx915ks17R47jRLSTAzKQ","e":"AQAB","kid":"lTaXmTWTLlyMaKu10MMeg","x5t":"Q3TDUCc9BoIBi_r_x8QdujkAs4Y","x5c":["MIIDDTCCAfWgAwIBAgIJZCbwa9ftqq3LMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMTGWRldi03b3huYnBwby51cy5hdXRoMC5jb20wHhcNMjEwOTE0MDU1NDE4WhcNMzUwNTI0MDU1NDE4WjAkMSIwIAYDVQQDExlkZXYtN294bmJwcG8udXMuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn9XWSXN+5+4I+zzdoKbUT4BxM51TN8jPzBPMwi7kN40zxDjGFcyPTN0327DD1Y7WuScwln2jcrcQTYeF4uCbKKJRYXi2alZGxRinvfhktSb9g7m2qP09x1t9oSUepV4gvSatQMQTXZFS9ZmXW4CBTIVqPohgwgaWXnOtPo9zuC5q/rJFRwAGdEpvJqnLx1fKQklOP0UAKpKwAFsn5I/b7EyOlcNcPMEv6s4KxPohMGZCpf7XP8i9O0MdRuKIold/PDSt4vBttJF5uh5i4sL5FduxhpDIgEtDLdg6+GsiKH35SgFmyp1wg0UMtT8eD6F+nVx915ks17R47jRLSTAzKQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQyt3rhyqHkWEZjwmSaX/CC2/piHjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAAZdUso2Rzpe4c8wMhAUH5RMf/oX7uoPCagEfljURtBPzpbtjglaPfWpOBh/PpA8/dPJCJfQtYN2yUzHFtmpqehEISZwrFkvHhTsw/fUKAvqAoZsLw0CfjURLBRK+YU+SPG8GILDlkSuJpzGxf8fbM2iZQVT7FtwGY2BwDZ7efdse0h6kKZSplXcVhf1RQLB9Ega4bwZZiZfbU3NeU8CTK1qKPGZ3z/sa4TwDpKTRfypQOhqceABw6X7WDh/CPOH+XS4hqJNxKLBNlAsONPBdO9ynVTNZFpFzSbXps1mOkta1cS7Lq28Q2vzilDie5JqKO9UOc84dYL4c4nqBK1r6QI="]},{"alg":"RS256","kty":"RSA","use":"sig","n":"xZbtjp4G4pBUqYawiegyI6xp6NAbw8xzfa2FhQ96NaQMrDE_n7ZQSpw3-WasUaXe8p4cOcRu_Yk90C_K9kTh_Va8nDSpU1YG87eAkGWobUjCHd8V-kG18dJXPNl0W-sFavv85cABum72yZ_Myl0atnIvJ-17McwKonJ3R1Wo514kwTq5WpXz9JTM7UqvP9ologulEvSeDkk0bab2qJTxsUiPE0nRSg1fnDTvhdNBasXIufe7Nxp1o6_sKsnt2JDeoZpB1XwRvk0wCIdGCNgg04iG9-T4Q9Ox6rvK7We3Ga2bx2M2XoV9vz-pZt0bD9OWffHcKJOZ-KfXLg5RkDF-sQ","e":"AQAB","kid":"aDeCduk9eBjGYWIGBN5nc","x5t":"ToAEa5ym7l8929Pi7A_D3FxFUNg","x5c":["MIIDDTCCAfWgAwIBAgIJYfmCPcWQMqUNMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMTGWRldi03b3huYnBwby51cy5hdXRoMC5jb20wHhcNMjEwOTE0MDU1NDE4WhcNMzUwNTI0MDU1NDE4WjAkMSIwIAYDVQQDExlkZXYtN294bmJwcG8udXMuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxZbtjp4G4pBUqYawiegyI6xp6NAbw8xzfa2FhQ96NaQMrDE/n7ZQSpw3+WasUaXe8p4cOcRu/Yk90C/K9kTh/Va8nDSpU1YG87eAkGWobUjCHd8V+kG18dJXPNl0W+sFavv85cABum72yZ/Myl0atnIvJ+17McwKonJ3R1Wo514kwTq5WpXz9JTM7UqvP9ologulEvSeDkk0bab2qJTxsUiPE0nRSg1fnDTvhdNBasXIufe7Nxp1o6/sKsnt2JDeoZpB1XwRvk0wCIdGCNgg04iG9+T4Q9Ox6rvK7We3Ga2bx2M2XoV9vz+pZt0bD9OWffHcKJOZ+KfXLg5RkDF+sQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS1wLHSQsztD8l8WnhIK2l8gZmTTTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBADUgFkpAuEF5SoXeIFA4zekzbTNsT1ERgkyt9FyyMdpStHJL5OLmcykHqfs3AAvJl9F0sMChJTnGh1JSCnOAijYsORj6+xmUENUDdS9T+Oc8EPC/RtRJmowR9CIu3S23AerGSxofHN0k1kFfhI1i9W1YH0FgWgfQwAHds2rQd4x+QOcohlhwQqMOmvEsAsEgd0W7U99UUEYgGBhH2rNwR9A2YLHNe8E4qD/yQnH9CAo8/nhmQ4vIA4hnHf9vDadeEMgn1MliXchFUR1NS2WCbZfETN1HM52FVILMj432UyNP+K1a9Hl7M+c1c0h7J3F09h+B3rqZBunZNkkIEy1bqwQ="]}]};
  // const jwks = await Axios.get(jwksUrl);
  // const jwks = await Axios.get(jwksUrl);


  const signingKey = jwks.keys.filter((k) => k.kid === jwtKid)[0];

  if (!signingKey) {
    throw new Error(`Unable to find a signing key that matches '${jwtKid}'`);
  }

  const { x5c } = signingKey;

  const cert = `-----BEGIN CERTIFICATE-----\n${x5c[0]}\n-----END CERTIFICATE-----`;
  if (!jwt) {
    throw new Error("invalid token");
  }
  return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}
