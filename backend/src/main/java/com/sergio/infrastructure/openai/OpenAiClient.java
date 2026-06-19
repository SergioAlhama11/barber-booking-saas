package com.sergio.infrastructure.openai;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/v1/responses")
@RegisterRestClient(configKey = "openai")
public interface OpenAiClient {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response analyze(@HeaderParam("Authorization") String authorization, OpenAiRequest request);
}